import { listPlayModes } from "@adamsaxion/pricewar-engine";
import { jsonOk } from "@/server/pricewar/http";

export async function GET() {
  return jsonOk({ modes: listPlayModes() });
}
