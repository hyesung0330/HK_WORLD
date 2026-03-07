import { NextResponse } from 'next/server';
import { minioClient, bucketName, ensureBucket } from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    // 버킷 존재 여부 확인 및 생성
    await ensureBucket();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // 미니오에 업로드
    await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
      'Content-Type': file.type,
    });

    // 업로드된 파일의 URL 생성
    // 참고: 실 운영 환경에서는 별도의 도메인이나 CDN을 통해 접근하도록 설정해야 함
    const protocol = process.env.MINIO_PORT === '443' ? 'https' : 'http';
    const host = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    
    const url = `${protocol}://${host}:${port}/${bucketName}/${fileName}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
