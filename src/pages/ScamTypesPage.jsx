import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useT } from '../hooks/useT'

const SCAM_TYPES = {
  lo: [
    {
      id: 'phone',
      icon: '📞',
      title: 'ການສໍ້ໂກງທາງໂທລະສັບ',
      desc: 'ຜູ້ສໍ້ໂກງຈະໂທຫາທ່ານແລ້ວອ້າງຕົວເປັນເຈົ້າໜ້າທີ່ຕຳຫຼວດ, ເຈົ້າໜ້າທີ່ທະນາຄານ, ເຈົ້າຫນ້າທີ່ບໍລິສັດໂທລະຄົມມະນາຄົມ ຫຼື ເຈົ້າໜ້າທີ່ລັດ ເພື່ອຮຽກເງິນ, ຂໍຂໍ້ມູນສ່ວນຕົວ ຫຼື ລົງທະບຽນເບີ. ໂດຍຜູ້ສໍ້ໂກງມັກອ້າງວ່າທ່ານມີໜີ້, ກ່ຽວຂ້ອງຄະດີ,ບໍ່ສາມາດນຳໃຊ້ເບີ ຫຼື ຊະນະລາງວັນ.',
      warnings: [
        'ໂທຮຽກຮ້ອງໃຫ້ທ່ານຈ່າຍເງິນທັນທີ',
        'ອ້າງຕົວເປັນຕຳຫຼວດ, ທະນາຄານ ຫຼື ໜ່ວຍງານລັດ',
        'ຂົ່ມຂູ່ດ້ວຍຜົນທາງກົດໝາຍ ຫຼື ການຈັບກຸມ',
        'ຮຽກໃຫ້ໂອນເງິນໂດຍໄວ ບໍ່ມີເວລາໃຫ້ທ່ານໄດ້ຄິດ',
      ],
      tips: [
        'ວາງສາຍທັນທີຖ້າສົງໄສ',
        'ຢ່າໃຫ້ຂໍ້ມູນທະນາຄານທາງໂທລະສັບ',
        'ໂທກັບຫາທະນາຄານ ຫຼື ຕຳຫຼວດໂດຍຜ່ານເບີທາງການ ຫຼື ເຂົ້າໄປຖາມຂໍ້ມູນໂດຍກົງກັບເຈົ້າໜ້າ ທີ່ຢູ່ໃກ້ບ້ານທ່ານ ',
        'ໂທຫາຄົນໃກ້ຊິດ ຫຼື ຜູ້ທີ່ມີຄວາມຮຼ້ກ່ອນຕັດສິນໃຈ',
      ],
    },
    {
      id: 'sms',
      icon: '💬',
      title: 'ການສໍ້ໂກງທາງ SMS',
      desc: 'ມິດສາຊີບມັກສ້າງຂໍ້ຄວາມປອມທີ່ສົ່ງມາໃນນາມທະນາຄານ, ບໍລິສັດຂົນສົ່ງ ຫຼື ໜ່ວຍງານລັດ ພ້ອມລິ້ງທີ່ນຳໄປຫາເວັບໄຊທ໌ປອມ ຫຼື ໄປສູ່ການດາວໂຫຼດໄວຣັສ.',
      warnings: [
        'SMS ມີລິ້ງທີ່ໜ້າສົງໄສ',
        'ຮຽກໃຫ້ຢືນຢັນຂໍ້ມູນ ຫຼື ລົງທະບຽນໃໝ່',
        'ໃຊ້ຊື່ທະນາຄານ ຫຼື ຊື່ລັດຖະບານ',
        'ຂໍ້ຄວາມດ່ວນ ຮຽກໃຫ້ຕອບໂດຍໄວ',
      ],
      tips: [
        'ຢ່າກົດລິ້ງໃນ SMS ທີ່ບໍ່ຮູ້ຈັກ',
        'ໄປເວັບໄຊທ໌ທາງການໂດຍກົງຜ່ານໂປຣແກຣມບຣາວເຊີຂອງທ່ານ',
        'ທະນາຄານແທ້ ຈະບໍ່ຮຽກຂໍລະຫັດ OTP ຫຼື ລະຫັດຜ່ານທາງ SMS',
      ],
    },
    {
      id: 'phishing',
      icon: '🎣',
      title: 'ຟິດຊິງ (ການສໍ້ໂກງທາງລິ້ງ/ອີເມວ)',
      desc: 'ມິດສາຊີບສົ່ງລິ້ງ ຫຼື ອີເມວປອມທີ່ສ້າງໃຫ້ຄ້າຍຄືກັບທາງການ (ຂອງແທ້) ເພື່ອດຶງຂໍ້ມູນ username, ລະຫັດຜ່ານ ຫຼື ຂໍ້ມູນທະນາຄານ.',
      warnings: [
        'ທີ່ຢູ່ URL ສະກົດຜິດ, ປ່ຽນແປງ ຫຼື ຕ່າງຈາກຕົ້ນສະບັບເລັກໜ້ອຍ',
        'ຂໍລະຫັດຜ່ານ ຫຼື OTP ໂດຍກົງ',
        'ອີເມວທີ່ຮຽກຮ້ອງໃຫ້ "ອັບເດດຂໍ້ມູນ" ຫຼື "ຢືນຢັນບັນຊີ"',
        'ຕົວໜັງສືຜິດ ຫຼື ພາສາຂຽນຜິດ',
      ],
      tips: [
        'ກວດ URL ໃຫ້ຖ້ວນຖີ່ກ່ອນໃສ່ຂໍ້ມູນ',
        'ໃຊ້ການຢືນຢັນ 2 ຂັ້ນຕອນ (2FA)',
        'ຢ່າໃສ່ລະຫັດຜ່ານໃນໜ້າເວັບໄຊທ໌ທີ່ເຂົ້າຜ່ານລິ້ງ SMS ຫຼື ອີເມວ',
      ],
    },
    {
      id: 'social',
      icon: '📱',
      title: 'ການສໍ້ໂກງທາງໂຊເຊວ',
      desc: 'ຜູ້ສໍ້ໂກງໃຊ້ Facebook, TikTok, Telegram ຫຼື ແອັບສົ່ງຂໍ້ຄວາມ ສ້າງໂປຣໄຟລ໌ປອມ ຂາຍສິນຄ້າ, ຊວນລົງທຶນ ຫຼື ສ້າງຄວາມສຳພັນ.',
      warnings: [
        'ໂປຣໄຟລ໌ສ້າງຂື້ນໃໝ່, ນຳໃຊ້ຮູບຄົນທີ່ມີຊື່ສຽງ, ມີຮູບໜ້ອຍ ຫຼື ຮູບທີ່ລັກຂອງຄົນອື່ນມາ',
        'ລາຄາສິນຄ້າຖືກຜິດປົກກະຕິ',
        'ຮຽກໃຫ້ທ່ານຊຳລະເງີນຜ່ານຊ່ອງທາງທີ່ບໍ່ແມ່ນທາງການ',
        'ສ້າງຄວາມຮີບດ່ວນ, ບອກວ່າສິນຄ້າມີນ້ອຍເຫຼືອອັນສຸດທ້າຍ',
      ],
      tips: [
        'ຊື້ຂາຍຜ່ານແພລດຟອມທີ່ມີລະບົບປ້ອງກັນ',
        'ກວດໂປຣໄຟລ໌, ອ່ານຄຳຄິດເຫັນຂອງລູກຄ້າຄົນອື່ນ ແລະ ກວດປະຫວັດຜູ້ຂາຍ',
        'ຢ່າໂອນເງິນລ່ວງໜ້າໂດຍບໍ່ໄດ້ຮັບສິນຄ້າ',
      ],
    },
    {
      id: 'romance',
      icon: '💕',
      title: 'ການສໍ້ໂກງດ້ານຄວາມຮັກ',
      desc: 'ຜູ້ສໍ້ໂກງສ້າງໂປຣໄຟລ໌ເປັນຄົນດີ, ຄົນລວຍ, ຄົນມີຖານະ ຫຼື ສ້າງຄວາມສຳພັນທາງອາລົມ ຄວາມໄວ້ເນື້ອເຊື່ອໃຈໄລຍະຍາວ ກ່ອນຈະຂໍເງິນໂດຍອ້າງເຫດສຸກເສີນ, ທຸລະກິດ ຫຼື ຕ້ອງການໃຊ້ເງິນດ່ວນ.',
      warnings: [
        'ຮູ້ຈັກທາງອອນລາຍ ບໍ່ເຄີຍພົບໜ້າກັນ',
        'ເກີດມີຄວາມຮູ້ສືກຮັກໄວຜິດປົກກະຕິ',
        'ຂໍຢືມເງິນຫຼັງຈາກສ້າງຄວາມໄວ້ໃຈ',
        'ອ້າງວ່າຢູ່ຕ່າງປະເທດ ບໍ່ສາມາດມາພົບກັນໄດ້',
      ],
      tips: [
        'ກວດຮູບໂດຍ Google Image Search',
        'ຢ່າໂອນເງິນໃຫ້ຄົນທີ່ຮູ້ຈັກທາງອອນລາຍ',
        'ເລົ່າເລື່ອງລາວໃຫ້ກັບຄົນໃກ້ຊິດຟັງເພື່ອຂໍຄຳປຶກສາ',
      ],
    },
    {
      id: 'investment',
      icon: '💰',
      title: 'ການສໍ້ໂກງການລົງທຶນ',
      desc: 'ມິດສາຊີບສ້າງແພລດຟອມ Trading, Forex ຫຼື Crypto ປອມ ໂດຍສັນຍາວ່າຈະໄດ້ຮັບຜົນຕອບແທນສູງ ຫຼື ຮຽກຮ້ອງລົງທຶນຫຼາຍຂຶ້ນຖ້າຍາກໄດ້ເງຶນຄືນໄວ ແລ້ວຫາຍຕົວໄປ.',
      warnings: [
        'ຮັບປະກັນວ່າໄດ້ກຳໄລສູງ, ມີຄວາມສ່ຽງຕ່ຳ',
        'ກົດດັນໃຫ້ຮີບຮ້ອນລົງທຶນ',
        'ຖອນເງິນຍາກ ຫຼື ຕ້ອງຈ່າຍຄ່າທໍານຽມເພີ່ມ',
        'ອ້າງເປັນຄົນດັງ ຫຼື ໄດ້ຮັບອະນຸຍາດຈາກທາງການແລ້ວ',
      ],
      tips: [
        'ກວດໃບອະນຸຍາດການເງິນຂອງບໍລິສັດ',
        'ຢ່າລົງທຶນຫຼາຍໃນຄັ້ງດຽວ',
        'ຖ້າຖືກກົດດັນໃຫ້ຕ້ອງຮີບຮ້ອນລົງທຶນ ໃຫ້ໃຊ້ຄຳວ່າ "ຂໍຄິດກ່ອນ" ທຸກຄັ້ງ',
      ],
    },
    {
      id: 'job',
      icon: '💼',
      title: 'ການສໍ້ໂກງວຽກງານ',
      desc: 'ອ້າງວ່າວຽກງ່າຍ, ໄດ້ເງິນດີ ຫຼື ໄປເຮັດວຽກຕ່າງປະເທດ ແຕ່ຕ້ອງໄດ້ຈ່າຍຄ່າສະໝັກ ຫຼື ຄ່າມັດຈໍາກ່ອນ. ບາງກໍລະນີອາດກາຍເປັນການຄ້າມະນຸດ.',
      warnings: [
        'ຕ້ອງຈ່າຍເງິນກ່ອນໄດ້ວຽກ',
        'ເງິນເດືອນສູງຜິດປົກກະຕິ',
        'ໃບສະໝັກງ່າຍ ບໍ່ຕ້ອງສຳພາດ',
        'ຊວນໄປເຮັດວຽກຢູ່ຕ່າງປະເທດດ້ວຍຄວາມຮີບດ່ວນ',
      ],
      tips: [
        'ບໍລິສັດແທ້ ຈະບໍ່ຮຽກຄ່າສະໝັກວຽກ',
        'ກວດສວບໂຮງງານ ຫຼື ບໍລິສັດທີ່ເປັນທາງການ',
        'ບອກຄົນໃນຄອບຄົວເພື່ອຂໍຄຳປຶກສາ ກ່ອນຕົກລົງໄປເຮັດວຽກຢູ່ຕ່າງປະເທດ',
      ],
    },
    {
      id: 'lottery',
      icon: '🎰',
      title: 'ການສໍ້ໂກງລາງວັນ',
      desc: 'ມິດສາຊີບແຈ້ງວ່າທ່ານຊະນະລາງວັນ, ໄດ້ຮັບມໍລະດົກ ຫຼື ມີເງິນຖ້າໂອນ ແຕ່ຕ້ອງໄດ້ຈ່າຍຄ່າທໍານຽມ ຫຼື ພາສີກ່ອນ.',
      warnings: [
        'ຊະນະລາງວັນໂດຍທີ່ທ່ານບໍ່ໄດ້ສະມັກ ຫຼື ຊິງລາງວັນ',
        'ຕ້ອງຈ່າຍຄ່າທໍານຽມກ່ອນຮັບລາງວັນ',
        'ຮຽກຂໍຂໍ້ມູນສ່ວນຕົວ ຫຼື ບັນຊີທະນາຄານຈາກທ່ານ',
        'ເລັ່ງໃຫ້ຮີບດ່ວນ ອ້າງວ່າສ່ຽງຈະໝົດເຂດຮັບລາງວັນ',
      ],
      tips: [
        'ລາງວັນທີ່ແທ້ຈິງ ຈະບໍ່ຮຽກໃຫ້ທ່ານຈ່າຍເງິນກ່ອນ',
        'ຢ່າໃຫ້ຂໍ້ມູນບັດ ຫຼື ບັນຊີ',
        'ລາຍງານໄດ້ທີ່ Scanbers ຫຼື ໂທ 1533',
      ],
    },
    {
      id: 'threat',
      icon: '⚠️',
      title: 'ການຂົ່ມຂູ່ / Sextortion',
      desc: 'ຜູ້ສໍ້ໂກງຂົ່ມຂູ່ວ່າຈະເປີດເຜີຍຮູບ/ຂໍ້ມູນສ່ວນຕົວ ຫຼື ອ້າງຈະທຳຮ້າຍທ່ານ ຫຼື ຄົນໃນຄອບຄົວຂອງທ່ານ ເວັ້ນເສຍແຕ່ທ່ານຈ່າຍເງິນໃຫ້ພວກເຂົາ.',
      warnings: [
        'ຮຽກເງິນ ຫຼື ຄ່າໄຖ່',
        'ອ້າງມີຮູບ/ວິດີໂອສ່ວນຕົວຂອງທ່ານ',
        'ກົດດັນ ຫຼື ສົ່ງຂໍ້ຄວາມຊ້ຳໆ',
      ],
      tips: [
        'ຢ່າຈ່າຍເງີນໃຫ້ພວກນັ້ນເດັດຂາດ ເພາະການຈ່າຍຈະໃຫ້ເກີດມີການຮຽກຊ້ຳ',
        'ຢ່າເຈລະຈາຕໍ່ລອງ ເພາະຈະເຮັດໃຫ້ພວກເຂົາມີອຳນາດຕໍ່ລອງເພີ່ມຂື້ນ',
        'ໂທຫາຕຳຫຼວດທີ່ເບີ 1191 ຫຼື ສູນຕ້ານການສໍ້ໂກງອອນລາຍເບີ 1533 ທັນທີ',
      ],
    },
    {
      id: 'loan',
      icon: '🏦',
      title: 'ການສໍ້ໂກງກູ້ຢືມເງິນ',
      desc: 'ສະເໜີກູ້ເງິນດ່ວນໃນອັດຕາດອກເບ້ຍຕ່ຳ ຫຼື ທຸກຄົນສາມາດສະເໜີກູ້ໄດ້ ແຕ່ຕ້ອງຈ່າຍຄ່າທໍານຽມ ຫຼື ຄ່ານຳໃຊ້ລ່ວງໜ້າ.',
      warnings: [
        'ດອກເບ້ຍຕ່ຳຜິດປົກກະຕິ',
        'ສະໝັກໄດ້ທຸກຄົນໂດຍບໍ່ຕ້ອງກວດເຄຼດິດ',
        'ຕ້ອງຈ່າຍຄ່ານຳໃຊ້ ຫຼື ຄ່າປະກັນກ່ອນ',
        'ຕ້ອງຮີບໂອນເງີນເພື່ອສະໝັກ ຫຼື ຈະໝົດໂຄວຕ້າ',
      ],
      tips: [
        'ທະນາຄານແທ້ ຈະບໍ່ຮຽກຄ່ານຳໃຊ້ລ່ວງໜ້າ',
        'ກູ້ຜ່ານທະນາຄານທີ່ລົງທະບຽນໄດ້ຮັບອະນຸຍາດຈາກທະນາຄານແຫ່ງ ສປປ ລາວ ເທົ່ານັ້ນ',
        'ລາຍງານຜ່ານ Scanbers ຫຼື ໂທ 1533',
      ],
    },
  ],

  en: [
    {
      id: 'phone',
      icon: '📞',
      title: 'Phone Scams',
      desc: 'Scammers call pretending to be police, banks, or government officials to demand money or personal information. Victims are often told they owe a debt, are involved in a crime, or have won something.',
      warnings: [
        'Demands for immediate payment',
        'Caller claims to be from police, bank or government',
        'Threats of arrest or legal action',
        'High-pressure tactics with no time to think',
      ],
      tips: [
        'Hang up immediately if suspicious',
        'Never give bank details over the phone',
        'Call your bank or police directly using official numbers',
        'Talk to family before making any payment',
      ],
    },
    {
      id: 'sms',
      icon: '💬',
      title: 'SMS / Text Scams',
      desc: 'Fake text messages appearing to come from banks, delivery services, or government agencies contain links to fake websites or malware downloads designed to steal your information.',
      warnings: [
        'Messages with suspicious or shortened links',
        'Requests to verify account details',
        'Uses bank or government names',
        'Urgent tone demanding fast action',
      ],
      tips: [
        'Never tap links in unexpected SMS messages',
        'Go directly to official websites via your browser',
        'Real banks will never ask for OTPs or passwords via SMS',
      ],
    },
    {
      id: 'phishing',
      icon: '🎣',
      title: 'Phishing (Email & Link Scams)',
      desc: 'Fake links or emails designed to look official trick you into entering your username, password, or banking credentials on a counterfeit website.',
      warnings: [
        'Slightly misspelled or altered URL',
        'Directly requests your password or OTP',
        'Emails asking you to "update" or "verify" your account',
        'Poor grammar or spelling in the message',
      ],
      tips: [
        'Check the full URL carefully before entering any data',
        'Enable two-factor authentication (2FA)',
        'Never enter passwords on pages accessed via SMS or email links',
      ],
    },
    {
      id: 'social',
      icon: '📱',
      title: 'Social Media Scams',
      desc: 'Scammers use Facebook, TikTok, Telegram, or messaging apps to create fake profiles to sell goods, promote investments, or build relationships before stealing money.',
      warnings: [
        'New profile with few photos or stolen images',
        'Prices unusually cheap',
        'Payment requested through unofficial methods',
        'Creates urgency — "last item available"',
      ],
      tips: [
        'Buy through platforms that offer buyer protection',
        'Check seller profiles, reviews, and history',
        'Never transfer money upfront without receiving goods',
      ],
    },
    {
      id: 'romance',
      icon: '💕',
      title: 'Romance Scams',
      desc: 'Scammers build fake emotional relationships over time, then request money citing emergencies, business needs, or travel costs to visit you.',
      warnings: [
        'Met online, never met in person',
        'Moves to deep affection unusually fast',
        'Requests money after building trust',
        'Claims to be abroad and unable to meet',
      ],
      tips: [
        'Reverse image search their profile photo',
        'Never send money to someone you only know online',
        'Talk to trusted friends or family before acting',
      ],
    },
    {
      id: 'investment',
      icon: '💰',
      title: 'Investment Scams',
      desc: 'Fake trading platforms, Forex, or crypto schemes promise high guaranteed returns. Once you invest, withdrawals become impossible or require additional "fees".',
      warnings: [
        'Guaranteed high returns with low risk',
        'Pressure to invest quickly',
        'Difficult or impossible to withdraw funds',
        'Endorsements from celebrities (usually fake)',
      ],
      tips: [
        'Verify the company\'s financial licence',
        'Avoid putting all money into a single opportunity',
        'If rushed, always say "I need to think about it first"',
      ],
    },
    {
      id: 'job',
      icon: '💼',
      title: 'Job Scams',
      desc: 'Easy, high-paying jobs or overseas work opportunities that require an upfront registration fee or deposit before you start. Some lead to human trafficking situations.',
      warnings: [
        'Requires payment before employment',
        'Unusually high salary for simple tasks',
        'Hired without a proper interview',
        'Quick push to travel abroad',
      ],
      tips: [
        'Legitimate employers never charge recruitment fees',
        'Verify the company through official channels',
        'Always inform family before going abroad for work',
      ],
    },
    {
      id: 'lottery',
      icon: '🎰',
      title: 'Lottery & Prize Scams',
      desc: 'You are told you\'ve won a lottery, inheritance, or cash prize — but must pay a fee or tax upfront before you can collect your "winnings".',
      warnings: [
        'Winning a contest you never entered',
        'Must pay a fee to claim your prize',
        'Requests personal or banking information',
        'Urgent deadline to claim',
      ],
      tips: [
        'Legitimate prizes never require upfront payment',
        'Never provide card or account details',
        'Report to ScanBers or call 1533',
      ],
    },
    {
      id: 'threat',
      icon: '⚠️',
      title: 'Threat & Sextortion Scams',
      desc: 'Scammers threaten to expose private images or personal information, or claim they will harm you or your family unless you pay them.',
      warnings: [
        'Demands for money or gift cards',
        'Claims to have private photos or videos',
        'Repeated, pressure-filled messages',
      ],
      tips: [
        'Do not pay — paying only invites further demands',
        'Do not negotiate — it gives them more leverage',
        'Call police on 1191 or the fraud center on 1533 immediately',
      ],
    },
    {
      id: 'loan',
      icon: '🏦',
      title: 'Loan Fee Scams',
      desc: 'Fake lenders offer quick loans at low interest with no credit check — but require upfront "processing fees" or insurance payments before disbursing the loan.',
      warnings: [
        'Unusually low interest rates',
        'Approved for anyone, no credit check',
        'Must pay fees or insurance upfront',
        'Urgent — "limited quota"',
      ],
      tips: [
        'Real banks never charge upfront processing fees',
        'Only borrow from banks registered and authorized by the Bank of the Lao PDR',
        'Report through ScanBers or call 1533',
      ],
    },
  ],
}

export default function ScamTypesPage() {
  const { lang } = useLang()
  const t = useT()
  const types = SCAM_TYPES[lang] ?? SCAM_TYPES.lo
  const [open, setOpen] = useState(null)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-lao-blue to-lao-sky text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium font-lao">
            <span>🛡️</span>
            <span>{t.scamTypes.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-lao">{t.scamTypes.title}</h1>
          <p className="text-white/80 font-lao max-w-xl mx-auto">{t.scamTypes.subtitle}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-5xl mx-auto px-4 py-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {types.map(scam => {
            const isOpen = open === scam.id
            return (
              <div key={scam.id} className="card overflow-hidden">
                <button
                  className="w-full text-left p-5 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(isOpen ? null : scam.id)}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{scam.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-gray-900 font-lao text-sm">{scam.title}</h3>
                      <ChevronIcon className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-lao leading-relaxed line-clamp-2">{scam.desc}</p>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                    <p className="text-sm text-gray-700 font-lao leading-relaxed">{scam.desc}</p>

                    <div>
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 font-lao">
                        ⚠️ {t.scamTypes.warningLabel}
                      </h4>
                      <ul className="space-y-1">
                        {scam.warnings.map((w, i) => (
                          <li key={i} className="text-sm text-gray-700 font-lao flex gap-2">
                            <span className="text-amber-500 shrink-0">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 font-lao">
                        ✅ {t.scamTypes.tipLabel}
                      </h4>
                      <ul className="space-y-1">
                        {scam.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700 font-lao flex gap-2">
                            <span className="text-emerald-500 shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to={`/search?category=${scam.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-lao-sky hover:underline font-lao mt-1"
                    >
                      {t.scamTypes.searchThis} →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lao-blue text-white py-10 px-4 text-center">
        <p className="text-white/70 mb-3 text-sm font-lao">{t.home.ctaSub}</p>
        <Link to="/report" className="inline-block bg-lao-red text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-lao">
          {t.home.ctaBtn}
        </Link>
      </section>
    </div>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
