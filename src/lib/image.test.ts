import { afterEach, describe, expect, it, vi } from "vitest";
import { toAvatarDataUrl } from "./image";

afterEach(() => vi.unstubAllGlobals());

describe("patient portrait resizing", () => {
  it.each([[600, 1200, 128, 256], [1200, 600, 256, 128], [80, 120, 80, 120]])(
    "keeps the whole %i × %i portrait without stretching or upscaling", async (width, height, expectedWidth, expectedHeight) => {
      const bitmap = { width, height, close: vi.fn() };
      const context = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() };
      const canvas = { width: 0, height: 0, getContext: () => context, toDataURL: vi.fn(() => "data:image/jpeg;base64,example") };
      vi.stubGlobal("createImageBitmap", vi.fn(async () => bitmap));
      vi.stubGlobal("document", { createElement: () => canvas });
      await toAvatarDataUrl({} as File);
      expect([canvas.width, canvas.height]).toEqual([expectedWidth, expectedHeight]);
      expect(context.drawImage).toHaveBeenCalledWith(bitmap, 0, 0, expectedWidth, expectedHeight);
      expect(bitmap.close).toHaveBeenCalledOnce();
    },
  );
});
