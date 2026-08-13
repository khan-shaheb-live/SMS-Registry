import { PrismaClient, StudentStatus, ProgrammeStatus, GradeClassification } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

function getClassification(grade: number): GradeClassification {
  if (grade >= 70) return GradeClassification.DISTINCTION
  if (grade >= 60) return GradeClassification.MERIT
  if (grade >= 40) return GradeClassification.PASS
  return GradeClassification.FAIL
}

async function main() {
  console.log('🌱 Starting seed...')

  // ── Clean existing data ──────────────────────────────────────────────────
  await prisma.grade.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.fee.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.user.deleteMany()
  await prisma.student.deleteMany()
  await prisma.programme.deleteMany()

  // ── Programmes ───────────────────────────────────────────────────────────
  const bscs = await prisma.programme.create({
    data: {
      name: 'BSc Computer Science',
      code: 'BSC-CS',
      defaultFee: new Decimal(9250),
      status: ProgrammeStatus.ACTIVE,
    },
  })

  const bab = await prisma.programme.create({
    data: {
      name: 'BA Business Management',
      code: 'BA-BM',
      defaultFee: new Decimal(8500),
      status: ProgrammeStatus.ACTIVE,
    },
  })

  console.log('✅ Programmes created')

  // ── Staff user ───────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'staff@university.ac.uk',
      role: 'STAFF',
    },
  })

  // ── Students ─────────────────────────────────────────────────────────────
  // Student 1: Alice Chen — Enrolled, BSc CS, FULLY PAID, has published Distinction result
  const alice = await prisma.student.create({
    data: {
      studentId: 'SMS-2025-0001',
      fullName: 'Alice Chen',
      email: 'alice.chen@student.university.ac.uk',
      dateOfBirth: new Date('2002-03-15'),
      programmeId: bscs.id,
      academicYear: '2024-2025',
      status: StudentStatus.ENROLLED,
    },
  })

  // Student 2: Bob Patel — Enrolled, BSc CS, OUTSTANDING balance, has published Pass result
  const bob = await prisma.student.create({
    data: {
      studentId: 'SMS-2025-0002',
      fullName: 'Bob Patel',
      email: 'bob.patel@student.university.ac.uk',
      dateOfBirth: new Date('2001-07-22'),
      programmeId: bscs.id,
      academicYear: '2024-2025',
      status: StudentStatus.ENROLLED,
    },
  })

  // Student 3: Carol White — Enrolled, BA BM, OVERDUE fees (due date passed), late submission
  const carol = await prisma.student.create({
    data: {
      studentId: 'SMS-2025-0003',
      fullName: 'Carol White',
      email: 'carol.white@student.university.ac.uk',
      dateOfBirth: new Date('2003-11-08'),
      programmeId: bab.id,
      academicYear: '2024-2025',
      status: StudentStatus.ENROLLED,
    },
  })

  // Student 4: David Kim — DEFERRED, BSc CS, partially paid, withheld result
  const david = await prisma.student.create({
    data: {
      studentId: 'SMS-2025-0004',
      fullName: 'David Kim',
      email: 'david.kim@student.university.ac.uk',
      dateOfBirth: new Date('2000-05-30'),
      programmeId: bscs.id,
      academicYear: '2024-2025',
      status: StudentStatus.DEFERRED,
    },
  })

  // Student 5: Emma Davis — WITHDRAWN, BA BM, outstanding fees, no submissions
  const emma = await prisma.student.create({
    data: {
      studentId: 'SMS-2025-0005',
      fullName: 'Emma Davis',
      email: 'emma.davis@student.university.ac.uk',
      dateOfBirth: new Date('2002-09-12'),
      programmeId: bab.id,
      academicYear: '2024-2025',
      status: StudentStatus.WITHDRAWN,
    },
  })

  // Student 6: James Wilson — COMPLETED, BA BM, fully paid, has Merit result
  const james = await prisma.student.create({
    data: {
      studentId: 'SMS-2024-0001',
      fullName: 'James Wilson',
      email: 'james.wilson@student.university.ac.uk',
      dateOfBirth: new Date('1999-12-03'),
      programmeId: bab.id,
      academicYear: '2023-2024',
      status: StudentStatus.COMPLETED,
    },
  })

  console.log('✅ Students created')

  // ── User accounts for students ───────────────────────────────────────────
  await prisma.user.createMany({
    data: [
      { email: alice.email, role: 'STUDENT', studentId: alice.id },
      { email: bob.email, role: 'STUDENT', studentId: bob.id },
      { email: carol.email, role: 'STUDENT', studentId: carol.id },
      { email: david.email, role: 'STUDENT', studentId: david.id },
      { email: emma.email, role: 'STUDENT', studentId: emma.id },
      { email: james.email, role: 'STUDENT', studentId: james.id },
    ],
  })

  // ── Fees ─────────────────────────────────────────────────────────────────
  const today = new Date()
  const pastDue = new Date(today.getFullYear(), today.getMonth() - 2, 1) // 2 months ago — OVERDUE
  const futureDue = new Date(today.getFullYear(), today.getMonth() + 3, 1) // 3 months ahead

  await prisma.fee.createMany({
    data: [
      { studentId: alice.id, amount: new Decimal(9250), dueDate: futureDue },  // FULLY PAID
      { studentId: bob.id, amount: new Decimal(9250), dueDate: futureDue },    // OUTSTANDING
      { studentId: carol.id, amount: new Decimal(8500), dueDate: pastDue },    // OVERDUE
      { studentId: david.id, amount: new Decimal(9250), dueDate: pastDue },    // partially paid, overdue
      { studentId: emma.id, amount: new Decimal(8500), dueDate: pastDue },     // OUTSTANDING, overdue
      { studentId: james.id, amount: new Decimal(8500), dueDate: futureDue },  // COMPLETED, fully paid
    ],
  })

  console.log('✅ Fees created')

  // ── Payments ─────────────────────────────────────────────────────────────
  const parseDate = (str: string) => new Date(str)

  await prisma.payment.createMany({
    data: [
      // Alice — fully paid (2 payments totalling £9250)
      { studentId: alice.id, amount: new Decimal(5000), paymentDate: parseDate('2025-01-15'), referenceNumber: 'PAY-2025-001', notes: 'First instalment' },
      { studentId: alice.id, amount: new Decimal(4250), paymentDate: parseDate('2025-04-10'), referenceNumber: 'PAY-2025-002', notes: 'Final payment' },

      // Bob — partial payment (£3000 paid, £6250 outstanding)
      { studentId: bob.id, amount: new Decimal(3000), paymentDate: parseDate('2025-02-01'), referenceNumber: 'PAY-2025-003', notes: 'Partial payment' },

      // Carol — no payments (£8500 overdue)

      // David — partial (£4000 paid, £5250 outstanding, overdue)
      { studentId: david.id, amount: new Decimal(4000), paymentDate: parseDate('2025-01-20'), referenceNumber: 'PAY-2025-004', notes: 'First instalment' },

      // Emma — no payments

      // James — fully paid
      { studentId: james.id, amount: new Decimal(8500), paymentDate: parseDate('2024-09-01'), referenceNumber: 'PAY-2024-001', notes: 'Full payment' },
    ],
  })

  console.log('✅ Payments created')

  // ── Assessments ──────────────────────────────────────────────────────────
  const now = new Date()

  // Assessment 1: Past deadline (CLOSED) — BSc CS
  const asmtAlgorithms = await prisma.assessment.create({
    data: {
      title: 'Algorithm Design & Analysis',
      module: 'CS301 — Algorithms',
      programmeId: bscs.id,
      academicYear: '2024-2025',
      description: 'Design and analyse three sorting algorithms. Include time complexity analysis and empirical benchmarks.',
      deadline: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  })

  // Assessment 2: Open (deadline in future) — BSc CS
  const asmtWebDev = await prisma.assessment.create({
    data: {
      title: 'Full-Stack Web Application',
      module: 'CS401 — Web Development',
      programmeId: bscs.id,
      academicYear: '2024-2025',
      description: 'Build a full-stack web application demonstrating REST API design, database integration, and responsive frontend development.',
      deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days ahead
    },
  })

  // Assessment 3: Closing soon (≤7 days) — BA BM
  const asmtMarketing = await prisma.assessment.create({
    data: {
      title: 'Marketing Strategy Report',
      module: 'BM201 — Marketing Principles',
      programmeId: bab.id,
      academicYear: '2024-2025',
      description: 'Prepare a comprehensive marketing strategy for a hypothetical product launch. Include market analysis, target segmentation, and a 12-month plan.',
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days ahead (CLOSING SOON)
    },
  })

  // Assessment 4: Past deadline — BA BM (for James, 2023-2024)
  const asmtFinance = await prisma.assessment.create({
    data: {
      title: 'Financial Management Essay',
      module: 'BM302 — Financial Management',
      programmeId: bab.id,
      academicYear: '2023-2024',
      description: 'Critically evaluate capital structure theories and their practical application in modern corporations.',
      deadline: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    },
  })

  console.log('✅ Assessments created')

  // ── Submissions ──────────────────────────────────────────────────────────
  // Alice — submitted algorithms on time, submitted web dev
  const subAliceAlgo = await prisma.submission.create({
    data: {
      studentId: alice.id,
      assessmentId: asmtAlgorithms.id,
      fileName: 'alice_chen_algorithms_submission.pdf',
      filePath: 'uploads/seed/alice_algorithms.pdf',
      fileSize: 524288, // 512 KB
      mimeType: 'application/pdf',
      submittedAt: new Date(asmtAlgorithms.deadline.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before deadline
      isLate: false,
    },
  })

  // Bob — submitted algorithms on time (different grade)
  const subBobAlgo = await prisma.submission.create({
    data: {
      studentId: bob.id,
      assessmentId: asmtAlgorithms.id,
      fileName: 'bob_patel_algorithms.pdf',
      filePath: 'uploads/seed/bob_algorithms.pdf',
      fileSize: 348160,
      mimeType: 'application/pdf',
      submittedAt: new Date(asmtAlgorithms.deadline.getTime() - 1 * 24 * 60 * 60 * 1000),
      isLate: false,
    },
  })

  // Carol — submitted marketing report LATE
  const subCarolMarketing = await prisma.submission.create({
    data: {
      studentId: carol.id,
      assessmentId: asmtMarketing.id,
      fileName: 'carol_white_marketing_draft.docx',
      filePath: 'uploads/seed/carol_marketing.docx',
      fileSize: 215040,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago — but deadline is still future, so NOT late
      isLate: false,
    },
  })

  // David — submitted algorithms LATE (after deadline)
  const subDavidAlgo = await prisma.submission.create({
    data: {
      studentId: david.id,
      assessmentId: asmtAlgorithms.id,
      fileName: 'david_kim_algorithms_late.pdf',
      filePath: 'uploads/seed/david_algorithms.pdf',
      fileSize: 450560,
      mimeType: 'application/pdf',
      submittedAt: new Date(asmtAlgorithms.deadline.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days AFTER deadline
      isLate: true,
    },
  })

  // James — submitted finance essay on time
  const subJamesFinance = await prisma.submission.create({
    data: {
      studentId: james.id,
      assessmentId: asmtFinance.id,
      fileName: 'james_wilson_financial_management.pdf',
      filePath: 'uploads/seed/james_finance.pdf',
      fileSize: 614400,
      mimeType: 'application/pdf',
      submittedAt: new Date(asmtFinance.deadline.getTime() - 5 * 24 * 60 * 60 * 1000),
      isLate: false,
    },
  })

  console.log('✅ Submissions created')

  // ── Grades ────────────────────────────────────────────────────────────────
  // Alice — Distinction (78), PUBLISHED
  await prisma.grade.create({
    data: {
      submissionId: subAliceAlgo.id,
      grade: 78,
      classification: getClassification(78), // DISTINCTION
      isPublished: true,
      publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  // Bob — Pass (45), PUBLISHED
  await prisma.grade.create({
    data: {
      submissionId: subBobAlgo.id,
      grade: 45,
      classification: getClassification(45), // PASS
      isPublished: true,
      publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  })

  // David — Merit (65), WITHHELD (not published)
  await prisma.grade.create({
    data: {
      submissionId: subDavidAlgo.id,
      grade: 65,
      classification: getClassification(65), // MERIT
      isPublished: false,
    },
  })

  // James — Merit (62), PUBLISHED
  await prisma.grade.create({
    data: {
      submissionId: subJamesFinance.id,
      grade: 62,
      classification: getClassification(62), // MERIT
      isPublished: true,
      publishedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    },
  })

  // Carol — no grade yet (submitted, awaiting grading)
  // Emma — no submissions, no grades

  console.log('✅ Grades created')
  console.log('')
  console.log('🎉 Seed complete!')
  console.log('')
  console.log('Demo data summary:')
  console.log('  👩 Alice Chen    — SMS-2025-0001 | Enrolled | Fully paid   | Distinction (published)')
  console.log('  👨 Bob Patel     — SMS-2025-0002 | Enrolled | Outstanding  | Pass (published)')
  console.log('  👩 Carol White   — SMS-2025-0003 | Enrolled | Overdue      | Submitted (awaiting grade)')
  console.log('  👨 David Kim     — SMS-2025-0004 | Deferred | Part paid    | Merit (withheld) + LATE submission')
  console.log('  👩 Emma Davis    — SMS-2025-0005 | Withdrawn| Overdue      | No submissions')
  console.log('  👨 James Wilson  — SMS-2024-0001 | Completed| Fully paid   | Merit (published)')
  console.log('')
  console.log('Staff login:   staff@university.ac.uk')
  console.log('Student logins: [student email from above]')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
