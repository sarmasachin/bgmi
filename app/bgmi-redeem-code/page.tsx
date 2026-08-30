import { permanentRedirect } from "next/navigation";
import { BGMI_LITE_REDEEM_CODE_PATH } from "@/src/lib/bgmiLiteRedeemCodes";

/** Old URL → canonical lite redeem path. */
export default function BgmiRedeemCodeRedirectPage() {
  permanentRedirect(BGMI_LITE_REDEEM_CODE_PATH);
}
