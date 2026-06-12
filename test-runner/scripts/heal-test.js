// scripts/heal-test.js
import { healSelector } from '../helpers/healer.js';
import { PAGE_URL } from '../helpers/config.js';

const brokenSelector = process.argv[2];
const baselineText   = process.argv[3];

if (!brokenSelector) {
  console.error('Usage: node scripts/heal-test.js "#broken-selector" "optional hint"');
  process.exit(1);
}

(async () => {
  console.log(`\n🔍  Healing: ${brokenSelector}`);
  console.log(`   Page   : ${PAGE_URL}`);
  if (baselineText) console.log(`   Hint   : ${baselineText}`);

  try {
    const result = await healSelector({ url: PAGE_URL, brokenSelector, baselineText });
    if (result?.success) {
      console.log('\n══════════════════════════════════');
      console.log(`    HEALED`);
      console.log(`  Recommended : ${result.recommended}`);
      console.log(`  Score       : ${result.score}`);
      console.log('══════════════════════════════════');
    } else {
      console.error(`\n  Healing failed: ${result?.message}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`\n  Error: ${e.message}`);
    process.exit(1);
  }
})();
