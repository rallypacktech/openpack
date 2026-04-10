import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, memberName } = await req.json();

    if (!type || !memberName) {
      return Response.json({ error: 'Type and member name required' }, { status: 400 });
    }

    const notifications = [];

    if (type === 'family_member') {
      // Notifications for new family member
      notifications.push({
        title: 'Update Your Emergency Supplies',
        message: `You've added ${memberName} to your family. Consider adding: 1 gallon water per day (3-day supply), non-perishable food, medications, and personal documents to your caches.`,
        type: 'info'
      });

      notifications.push({
        title: 'Review Your Go Bags',
        message: `Make sure each family member including ${memberName} has their own go bag with essentials ready.`,
        type: 'info'
      });
    } else if (type === 'pet') {
      // Notifications for new pet
      const petType = memberName.split(' (')[1]?.replace(')', '') || 'pet';
      
      notifications.push({
        title: 'Pet Emergency Supplies Needed',
        message: `You've added ${memberName}. Essential items: 3-day food/water supply, medications, vaccination records, carrier/crate, leash, collar with ID tags, and recent photos.`,
        type: 'info'
      });

      if (petType.toLowerCase() === 'dog') {
        notifications.push({
          title: 'Dog-Specific Emergency Items',
          message: 'Add to your cache: neon reflective collar and leash, rabies records, waste bags, and a comfort item (toy or blanket).',
          type: 'info'
        });
      } else if (petType.toLowerCase() === 'cat') {
        notifications.push({
          title: 'Cat-Specific Emergency Items',
          message: 'Add to your cache: carrier, litter box supplies, vaccination records, and familiar bedding or toys.',
          type: 'info'
        });
      } else if (petType.toLowerCase() === 'bird') {
        notifications.push({
          title: 'Bird-Specific Emergency Items',
          message: 'Add to your cache: travel cage, food/water dishes, cage cover, and any necessary supplements or medications.',
          type: 'info'
        });
      }
    } else if (type === 'region_change') {
      // Notifications for region change
      const { newRegion, disasterTypes } = await req.json();
      
      if (newRegion && disasterTypes && disasterTypes.length > 0) {
        const disasterList = disasterTypes.slice(0, 3).join(', ');
        notifications.push({
          title: 'Location-Based Supply Update',
          message: `Your new location (${newRegion}) is prone to: ${disasterList}. Review your caches for region-specific emergency supplies.`,
          type: 'warning'
        });
      }
    }

    // Create all notifications
    await Promise.all(
      notifications.map(notif => 
        base44.entities.Notification.create(notif)
      )
    );

    return Response.json({ 
      success: true,
      count: notifications.length
    });

  } catch (error) {
    console.error("Error generating notifications:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});