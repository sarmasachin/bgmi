import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("Paste BOTH lines into server .env (same generate run — never mix old/new):");
console.log(`VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);
console.log('VAPID_SUBJECT="mailto:support@sensitivitysettings.com"');
console.log("");
console.log("After changing keys: delete old PushSubscription rows and ask users to Enable again.");
