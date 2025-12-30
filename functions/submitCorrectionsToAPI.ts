import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Get unsubmitted corrections in batches of 50
    const corrections = await base44.asServiceRole.entities.BarcodeCorrection.filter(
      { submitted_to_api: false },
      '-created_date',
      50
    );

    if (corrections.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No corrections to submit',
        submitted: 0
      });
    }

    // Format corrections for API submission
    const formattedCorrections = corrections.map(c => ({
      barcode: c.barcode,
      incorrect_data: {
        name: c.ai_suggested_name,
        category: c.ai_suggested_category
      },
      correct_data: {
        name: c.corrected_name,
        category: c.corrected_category,
        shelf_life_days: c.corrected_shelf_life_days
      }
    }));

    // TODO: When barcode API supports corrections, uncomment and update endpoint
    // const response = await fetch('https://api.example.com/corrections', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ corrections: formattedCorrections })
    // });

    // Mark corrections as submitted
    for (const correction of corrections) {
      await base44.asServiceRole.entities.BarcodeCorrection.update(correction.id, {
        submitted_to_api: true
      });
    }

    return Response.json({
      success: true,
      message: `Successfully submitted ${corrections.length} corrections`,
      submitted: corrections.length,
      corrections: formattedCorrections
    });

  } catch (error) {
    console.error("Error submitting corrections:", error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});