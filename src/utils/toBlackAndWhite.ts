import { Skia, ImageFormat } from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system/legacy';

export async function toBlackAndWhite(
  uri: string,
  { contrast = 3, threshold = 0.5 } = {},
): Promise<string> {
  console.log('Skia keys:', Object.keys(Skia ?? {}));
  console.log('FS keys:', Object.keys(FileSystem ?? {}));

  console.log('1 loading data', uri);
  const data = await Skia.Data.fromURI(uri);

  console.log('2 decoding');
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) throw new Error('Could not decode image');

  console.log('3 surface', image.width(), image.height());
  const surface = Skia.Surface.MakeOffscreen(image.width(), image.height());
  if (!surface) throw new Error('Could not create offscreen surface');

  console.log('4 filter');
  const k = contrast;
  const b = 0.5 - k * threshold;
  const colorFilter = Skia.ColorFilter.MakeMatrix([
    0.299 * k,
    0.587 * k,
    0.114 * k,
    0,
    b,
    0.299 * k,
    0.587 * k,
    0.114 * k,
    0,
    b,
    0.299 * k,
    0.587 * k,
    0.114 * k,
    0,
    b,
    0,
    0,
    0,
    1,
    0,
  ]);
  const paint = Skia.Paint();
  paint.setColorFilter(colorFilter);

  console.log('5 draw');
  const canvas = surface.getCanvas();
  canvas.drawImage(image, 0, 0, paint);
  surface.flush();

  console.log('6 encode');
  const base64 = surface.makeImageSnapshot().encodeToBase64(ImageFormat.PNG, 100);

  console.log('7 write');
  const outUri = `${FileSystem.cacheDirectory}bw-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(outUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return outUri;
}
