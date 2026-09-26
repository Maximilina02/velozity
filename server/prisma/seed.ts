import { PrismaClient } from '@prisma/client';
import { Role, TaskStatus, TaskPriority } from '../src/types';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Velozity...');

  // 1. Clear existing data in reverse relation order
  console.log('🧹 Cleaning old data...');
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 2. Create Users: 1 Admin, 2 PMs, 4 Developers
  console.log('👤 Seeding Users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@velozity.com',
      password: hashedPassword,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Sarah Mitchell (PM)',
      email: 'pm.sarah@velozity.com',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Marcus Vance (PM)',
      email: 'pm.marcus@velozity.com',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Ravi Kumar',
      email: 'dev.ravi@velozity.com',
      password: hashedPassword,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'dev.elena@velozity.com',
      password: hashedPassword,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'dev.david@velozity.com',
      password: hashedPassword,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'dev.priya@velozity.com',
      password: hashedPassword,
      role: Role.DEVELOPER,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  console.log('🏢 Seeding Clients...');
  const client1 = await prisma.client.create({
    data: {
      name: 'Acme Corporation',
      email: 'contact@acmecorp.com',
      company: 'Acme Enterprises Inc.',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'FinTech Horizons',
      email: 'billing@fintechhorizons.io',
      company: 'FinTech Horizons Ltd.',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'HealthPulse Labs',
      email: 'support@healthpulse.org',
      company: 'HealthPulse Global Inc.',
    },
  });

  // 3. Create at least 3 Projects
  // PM Sarah manages Project 1 and 2
  // PM Marcus manages Project 3
  console.log('📁 Seeding Projects...');
  const project1 = await prisma.project.create({
    data: {
      name: 'Cloud Banking Portal 2.0',
      description: 'Next-generation web portal with real-time financial ledger and high-security compliance.',
      clientId: client2.id,
      managerId: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Acme Supply Chain Optimizer',
      description: 'Automated warehouse inventory tracking system with IoT telemetry and logistics analytics.',
      clientId: client1.id,
      managerId: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'HealthPulse Patient Records',
      description: 'HIPAA compliant electronic health records (EHR) sync and tele-consultation platform.',
      clientId: client3.id,
      managerId: pm2.id,
    },
  });

  // 4. Create 5+ Tasks per project with various statuses, priorities, overdue tasks
  console.log('📝 Seeding Tasks (at least 5 per project)...');
  const now = new Date();
  const pastDate1 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago (OVERDUE)
  const pastDate2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (OVERDUE)
  const futureDate1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days ahead
  const futureDate2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days ahead
  const futureDate3 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days ahead

  // PROJECT 1 TASKS (Sarah PM)
  const t1 = await prisma.task.create({
    data: {
      taskNumber: 1,
      title: 'Architect Multi-Factor Auth Flow',
      description: 'Implement TOTP and SMS fallback authentication microservice with rate limiting.',
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate1,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id, // Ravi
    },
  });

  const t2 = await prisma.task.create({
    data: {
      taskNumber: 2,
      title: 'Audit Transaction Security Webhooks',
      description: 'Check HMAC signature verification on inbound bank clearing partner webhooks.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate1, // OVERDUE 1
      isOverdue: true,
      projectId: project1.id,
      assignedToId: dev1.id, // Ravi
    },
  });

  const t3 = await prisma.task.create({
    data: {
      taskNumber: 3,
      title: 'Implement Transfer Ledger Export',
      description: 'Enable CSV and PDF streaming downloads of quarterly audited statement records.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id, // Ravi
    },
  });

  const t4 = await prisma.task.create({
    data: {
      taskNumber: 4,
      title: 'Wireframe Account Settings Page',
      description: 'Build user profile photo upload, notification preferences, and team permissions UI.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev2.id, // Elena
    },
  });

  const t5 = await prisma.task.create({
    data: {
      taskNumber: 5,
      title: 'Integrate Stripe Customer Portal',
      description: 'Allow customers to manage corporate subscription tiers and download VAT invoices.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate3,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev3.id, // David
    },
  });

  const t6 = await prisma.task.create({
    data: {
      taskNumber: 6,
      title: 'Implement Dark Mode Styling',
      description: 'Polish theme toggle and high-contrast color accessibility across portal widgets.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastDate2,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev2.id, // Elena
    },
  });

  // PROJECT 2 TASKS (Sarah PM)
  const t7 = await prisma.task.create({
    data: {
      taskNumber: 7,
      title: 'Fix Barcode Scanner WebSocket Reconnect',
      description: 'Warehouse handheld scanners drop socket connection during roaming between Wi-Fi APs.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate2, // OVERDUE 2
      isOverdue: true,
      projectId: project2.id,
      assignedToId: dev3.id, // David
    },
  });

  const t8 = await prisma.task.create({
    data: {
      taskNumber: 8,
      title: 'Build Stock Discrepancy Alert System',
      description: 'Send automated alerts to floor managers when inventory delta exceeds 2% variance.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev4.id, // Priya
    },
  });

  const t9 = await prisma.task.create({
    data: {
      taskNumber: 9,
      title: 'Optimize Warehouse Floor Plan Heatmap',
      description: 'Use HTML5 Canvas to render 15,000 pallet slots at 60 FPS without layout thrashing.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev1.id, // Ravi
    },
  });

  const t10 = await prisma.task.create({
    data: {
      taskNumber: 10,
      title: 'Setup Automated Daily Ingestion Cron',
      description: 'Pull daily CSV manifests from legacy SAP ERP FTP servers at 02:00 UTC.',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDate1,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev3.id, // David
    },
  });

  const t11 = await prisma.task.create({
    data: {
      taskNumber: 11,
      title: 'Implement Carrier Tracking REST API',
      description: 'Expose endpoints for FedEx, UPS, and DHL shipment tracking webhook ingestion.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate3,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev4.id, // Priya
    },
  });

  // PROJECT 3 TASKS (Marcus PM)
  const t12 = await prisma.task.create({
    data: {
      taskNumber: 12,
      title: 'EHR FHIR API Gateway Integration',
      description: 'Connect internal data model with HL7/FHIR v4 medical record interchange schemas.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate1,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev2.id, // Elena
    },
  });

  const t13 = await prisma.task.create({
    data: {
      taskNumber: 13,
      title: 'Patient Portal WebRTC Video Consultation',
      description: 'Implement peer-to-peer encrypted video chat room between doctor and patient.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev4.id, // Priya
    },
  });

  const t14 = await prisma.task.create({
    data: {
      taskNumber: 14,
      title: 'Prescription Digital Signature Pad',
      description: 'Implement cryptographic signature canvas compliant with e-prescribe DEA mandates.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev2.id, // Elena
    },
  });

  const t15 = await prisma.task.create({
    data: {
      taskNumber: 15,
      title: 'Medical Laboratory PDF Parser',
      description: 'Extract blood panel test results and vital metrics from scanned lab report documents.',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDate2,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev4.id, // Priya
    },
  });

  const t16 = await prisma.task.create({
    data: {
      taskNumber: 16,
      title: 'Emergency Doctor Pager SMS Trigger',
      description: 'Trigger Twilio outbound SMS alerts when patient vital telemetry alerts go critical.',
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate1, // OVERDUE 3
      isOverdue: true,
      projectId: project3.id,
      assignedToId: dev2.id, // Elena
    },
  });

  // 5. Create Pre-existing Activity Logs
  console.log('⚡ Seeding Pre-existing Activity Logs...');
  const activities = [
    {
      action: 'STATUS_CHANGE',
      details: `${dev1.name} moved Task #${t3.taskNumber} from In Progress → In Review`,
      prevStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      taskId: t3.id,
      projectId: project1.id,
      userId: dev1.id,
      createdAt: new Date(now.getTime() - 25 * 60 * 1000), // 25 mins ago
    },
    {
      action: 'STATUS_CHANGE',
      details: `${dev1.name} moved Task #${t1.taskNumber} from In Review → Done`,
      prevStatus: TaskStatus.IN_REVIEW,
      newStatus: TaskStatus.DONE,
      taskId: t1.id,
      projectId: project1.id,
      userId: dev1.id,
      createdAt: new Date(now.getTime() - 110 * 60 * 1000), // 1.8 hrs ago
    },
    {
      action: 'TASK_ASSIGNED',
      details: `${pm1.name} assigned Task #${t2.taskNumber} to ${dev1.name}`,
      taskId: t2.id,
      projectId: project1.id,
      userId: pm1.id,
      createdAt: new Date(now.getTime() - 240 * 60 * 1000), // 4 hrs ago
    },
    {
      action: 'TASK_OVERDUE',
      details: `Task #${t2.taskNumber} "Audit Transaction Security Webhooks" became overdue`,
      prevStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_PROGRESS,
      taskId: t2.id,
      projectId: project1.id,
      userId: pm1.id,
      createdAt: new Date(now.getTime() - 500 * 60 * 1000), // 8.3 hrs ago
    },
    {
      action: 'STATUS_CHANGE',
      details: `${dev4.name} moved Task #${t8.taskNumber} from In Progress → In Review`,
      prevStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      taskId: t8.id,
      projectId: project2.id,
      userId: dev4.id,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 mins ago
    },
    {
      action: 'TASK_OVERDUE',
      details: `Task #${t7.taskNumber} "Fix Barcode Scanner WebSocket Reconnect" became overdue`,
      prevStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_PROGRESS,
      taskId: t7.id,
      projectId: project2.id,
      userId: pm1.id,
      createdAt: new Date(now.getTime() - 600 * 60 * 1000), // 10 hrs ago
    },
    {
      action: 'STATUS_CHANGE',
      details: `${dev4.name} moved Task #${t13.taskNumber} from In Progress → In Review`,
      prevStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      taskId: t13.id,
      projectId: project3.id,
      userId: dev4.id,
      createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 mins ago
    },
    {
      action: 'STATUS_CHANGE',
      details: `${dev4.name} moved Task #${t15.taskNumber} from In Review → Done`,
      prevStatus: TaskStatus.IN_REVIEW,
      newStatus: TaskStatus.DONE,
      taskId: t15.id,
      projectId: project3.id,
      userId: dev4.id,
      createdAt: new Date(now.getTime() - 700 * 60 * 1000), // 11.6 hrs ago
    },
  ];

  for (const act of activities) {
    await prisma.activityLog.create({ data: act });
  }

  // 6. Create Pre-existing Notifications
  console.log('🔔 Seeding Notifications...');
  // PM Sarah notified about Task 3 ready for review
  await prisma.notification.create({
    data: {
      userId: pm1.id,
      title: 'Task Ready For Review',
      message: `${dev1.name} moved Task #${t3.taskNumber} "Implement Transfer Ledger Export" to In Review.`,
      type: 'TASK_IN_REVIEW',
      taskId: t3.id,
      isRead: false,
    },
  });

  // PM Sarah notified about Task 8 ready for review
  await prisma.notification.create({
    data: {
      userId: pm1.id,
      title: 'Task Ready For Review',
      message: `${dev4.name} moved Task #${t8.taskNumber} "Build Stock Discrepancy Alert System" to In Review.`,
      type: 'TASK_IN_REVIEW',
      taskId: t8.id,
      isRead: false,
    },
  });

  // PM Marcus notified about Task 13 ready for review
  await prisma.notification.create({
    data: {
      userId: pm2.id,
      title: 'Task Ready For Review',
      message: `${dev4.name} moved Task #${t13.taskNumber} "Patient Portal WebRTC Video Consultation" to In Review.`,
      type: 'TASK_IN_REVIEW',
      taskId: t13.id,
      isRead: false,
    },
  });

  // Developer Ravi notified of assigned task
  await prisma.notification.create({
    data: {
      userId: dev1.id,
      title: 'New Task Assigned',
      message: `You were assigned Task #${t2.taskNumber}: "Audit Transaction Security Webhooks" in "Cloud Banking Portal 2.0"`,
      type: 'TASK_ASSIGNED',
      taskId: t2.id,
      isRead: false,
    },
  });

  // Developer Elena notified of assigned task
  await prisma.notification.create({
    data: {
      userId: dev2.id,
      title: 'New Task Assigned',
      message: `You were assigned Task #${t4.taskNumber}: "Wireframe Account Settings Page" in "Cloud Banking Portal 2.0"`,
      type: 'TASK_ASSIGNED',
      taskId: t4.id,
      isRead: true,
    },
  });

  console.log('✅ Seed complete!');
  console.log('---------------------------------------------------------');
  console.log('Demo Credentials for Evaluator (all use password: Password123!):');
  console.log('👑 Admin:           admin@velozity.com');
  console.log('📊 PM 1 (Sarah):    pm.sarah@velozity.com  (Projects 1 & 2)');
  console.log('📊 PM 2 (Marcus):   pm.marcus@velozity.com (Project 3)');
  console.log('💻 Dev 1 (Ravi):    dev.ravi@velozity.com');
  console.log('💻 Dev 2 (Elena):   dev.elena@velozity.com');
  console.log('💻 Dev 3 (David):   dev.david@velozity.com');
  console.log('💻 Dev 4 (Priya):   dev.priya@velozity.com');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
