import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }
    
    // In a real application, you would save this token to your database
    // and associate it with the currently logged-in user.
    console.log('Saving FCM token to database (simulation):', token);
    
    // For this prototype, we'll just log it to the console.
    // Example DB logic:
    // await db.user.update({
    //   where: { id: userId },
    //   data: { fcmToken: token },
    // });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription token received successfully' 
    });
  } catch (error) {
    console.error('Error saving subscription token:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
    try {
      const { token } = await request.json();
      
      if (!token) {
        return NextResponse.json(
          { error: 'FCM token is required' },
          { status: 400 }
        );
      }
      
      // In a real application, you would remove this token from your database.
      console.log('Removing FCM token from database (simulation):', token);

      // Example DB logic:
      // await db.user.update({
      //   where: { fcmToken: token },
      //   data: { fcmToken: null },
      // });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription removed successfully' 
      });
    } catch (error) {
      console.error('Error removing subscription:', error);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }
}