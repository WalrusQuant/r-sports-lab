import { WebR } from 'webr';

export interface ExecutionResult {
  stdout: string[];
  stderr: string[];
  images: ImageBitmap[];
  error: string | null;
}

export async function executeR(
  webR: WebR,
  code: string
): Promise<ExecutionResult> {
  const shelter = await new webR.Shelter();

  try {
    const result = await shelter.captureR(code, {
      withAutoprint: true,
      captureStreams: true,
      captureConditions: false,
      captureGraphics: {
        width: 504,
        height: 504,
        bg: 'white',
        pointsize: 12,
        capture: true,
      },
    });

    const stdout: string[] = [];
    const stderr: string[] = [];

    for (const output of result.output) {
      if (output.type === 'stdout') {
        stdout.push(output.data as string);
      } else if (output.type === 'stderr') {
        stderr.push(output.data as string);
      }
    }

    return {
      stdout,
      stderr,
      images: result.images,
      error: null,
    };
  } catch (err) {
    return {
      stdout: [],
      stderr: [],
      images: [],
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await shelter.purge();
  }
}
