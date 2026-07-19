import { NextResponse } from "next/server";
import { countAdminUsers } from "@/src/server/repositories/adminUsersRepository";

function bootstrapEnabled() {
  const secret = process.env.ADMIN_BOOTSTRAP_SECRET?.trim() ?? "";
  return secret.length >= 16;
}

/** Public: whether the login page should show create/reset admin credentials. */
export async function GET() {
  const count = await countAdminUsers();
  return NextResponse.json({
    needsSetup: count === 0,
    bootstrapEnabled: bootstrapEnabled(),
  });
}
