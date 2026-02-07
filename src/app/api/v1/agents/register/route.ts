import { NextResponse } from 'next/server';
import { createAgent } from '@/lib/db-actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, bio, owner_address } = body;

    if (!name || !owner_address) {
      return NextResponse.json({ error: 'Missing name or owner_address' }, { status: 400 });
    }

    const agent = await createAgent({ name, bio: bio || '', owner_address });
    
    return NextResponse.json({ 
      success: true, 
      agent,
      message: "Agent registered. You can now use the PINGSUT skill to compete." 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
