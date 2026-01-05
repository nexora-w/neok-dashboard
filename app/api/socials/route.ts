import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const socials = await db.collection('socials').find({}).toArray();
    return NextResponse.json(socials);
  } catch (error) {
    console.error('Error fetching socials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch socials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('socials').insertOne({
      name: name.toUpperCase(),
      url,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId, name: name.toUpperCase(), url },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating social:', error);
    return NextResponse.json(
      { error: 'Failed to create social' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, name, url } = body;

    if (!_id || !name || !url) {
      return NextResponse.json(
        { error: 'ID, name, and URL are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('socials').updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          name: name.toUpperCase(),
          url,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Social not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating social:', error);
    return NextResponse.json(
      { error: 'Failed to update social' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('socials').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Social not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social:', error);
    return NextResponse.json(
      { error: 'Failed to delete social' },
      { status: 500 }
    );
  }
}

