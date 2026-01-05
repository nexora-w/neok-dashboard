import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const bonuses = await db.collection('bonuses').find({}).toArray();
    return NextResponse.json(bonuses);
  } catch (error) {
    console.error('Error fetching bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subtitle, offers, code, image, url } = body;

    if (!name || !code || !url) {
      return NextResponse.json(
        { error: 'Name, code, and URL are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('bonuses').insertOne({
      name,
      logo: name,
      subtitle: subtitle || '',
      offers: offers || [],
      code: code.toUpperCase(),
      image: image || '',
      url,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId, name, code: code.toUpperCase(), url },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bonus:', error);
    return NextResponse.json(
      { error: 'Failed to create bonus' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, name, subtitle, offers, code, image, url } = body;

    if (!_id || !name || !code || !url) {
      return NextResponse.json(
        { error: 'ID, name, code, and URL are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('bonuses').updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          name,
          logo: name,
          subtitle: subtitle || '',
          offers: offers || [],
          code: code.toUpperCase(),
          image: image || '',
          url,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Bonus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating bonus:', error);
    return NextResponse.json(
      { error: 'Failed to update bonus' },
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
    const result = await db.collection('bonuses').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Bonus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bonus:', error);
    return NextResponse.json(
      { error: 'Failed to delete bonus' },
      { status: 500 }
    );
  }
}

