import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env } from './core-utils';
import { BedEntity, PlantingEntity, TaskEntity, JournalEntryEntity, UserProfileEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { getCompanionPlants } from "./companion-data";
import { getGardeningAdvice } from "./ai-advisor";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- BEDS ---
  const bedSchema = z.object({
    name: z.string().min(1, "Name is required"),
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"),
  });
  app.get('/api/beds', async (c) => {
    const page = await BedEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/beds', zValidator('json', bedSchema), async (c) => {
    const body = c.req.valid('json');
    const bed = await BedEntity.create(c.env, { id: crypto.randomUUID(), ...body, createdAt: Date.now() });
    return ok(c, bed);
  });
  app.get('/api/beds/:id', async (c) => {
    const { id } = c.req.param();
    const bed = new BedEntity(c.env, id);
    if (!(await bed.exists())) return notFound(c, 'Bed not found');
    return ok(c, await bed.getState());
  });
  app.put('/api/beds/:id', zValidator('json', bedSchema), async (c) => {
    const { id } = c.req.param();
    const body = c.req.valid('json');
    const bed = new BedEntity(c.env, id);
    if (!(await bed.exists())) return notFound(c, 'Bed not found');
    const currentState = await bed.getState();
    const updatedState = { ...currentState, ...body };
    await bed.save(updatedState);
    return ok(c, updatedState);
  });
  app.delete('/api/beds/:id', async (c) => {
    const { id } = c.req.param();
    await BedEntity.delete(c.env, id);
    const allPlantings = (await PlantingEntity.list(c.env)).items.filter(p => p.bedId === id).map(p => p.id);
    if (allPlantings.length > 0) await PlantingEntity.deleteMany(c.env, allPlantings);
    const allTasks = (await TaskEntity.list(c.env)).items.filter(t => t.bedId === id).map(t => t.id);
    if (allTasks.length > 0) await TaskEntity.deleteMany(c.env, allTasks);
    return ok(c, { id, deleted: true });
  });
  // --- PLANTINGS ---
  const plantingSchema = z.object({
    bedId: z.string().min(1, "Bed ID is required"),
    cropName: z.string().min(1, "Crop name is required"),
    plantingDate: z.number().positive("Planting date is required"),
    notes: z.string().optional(),
  });
  const updatePlantingSchema = z.object({ harvestDate: z.number().positive().optional() });
  app.get('/api/plantings', async (c) => {
    const bedId = c.req.query('bedId');
    const page = await PlantingEntity.list(c.env);
    const items = bedId ? page.items.filter(p => p.bedId === bedId) : page.items;
    return ok(c, items);
  });
  app.post('/api/plantings', zValidator('json', plantingSchema), async (c) => {
    const body = c.req.valid('json');
    const bed = new BedEntity(c.env, body.bedId);
    if (!(await bed.exists())) return bad(c, 'Associated bed not found');
    const companionPlants = getCompanionPlants(body.cropName);
    const planting = await PlantingEntity.create(c.env, { id: crypto.randomUUID(), ...body, createdAt: Date.now(), companionPlants });
    return ok(c, planting);
  });
  app.put('/api/plantings/:id', zValidator('json', updatePlantingSchema), async (c) => {
    const { id } = c.req.param();
    const body = c.req.valid('json');
    const planting = new PlantingEntity(c.env, id);
    if (!(await planting.exists())) return notFound(c, 'Planting not found');
    await planting.patch(body);
    return ok(c, await planting.getState());
  });
  app.delete('/api/plantings/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await PlantingEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // --- TASKS ---
  const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    dueDate: z.number().positive("Due date is required"),
    completed: z.boolean().default(false),
    bedId: z.string().optional(),
    plantingId: z.string().optional(),
    notes: z.string().optional(),
  });
  app.get('/api/tasks', async (c) => ok(c, (await TaskEntity.list(c.env)).items));
  app.post('/api/tasks', zValidator('json', taskSchema), async (c) => ok(c, await TaskEntity.create(c.env, { id: crypto.randomUUID(), ...c.req.valid('json'), createdAt: Date.now() })));
  app.put('/api/tasks/:id', zValidator('json', taskSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const task = new TaskEntity(c.env, id);
    if (!(await task.exists())) return notFound(c, 'Task not found');
    await task.patch(c.req.valid('json'));
    return ok(c, await task.getState());
  });
  app.delete('/api/tasks/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await TaskEntity.delete(c.env, c.req.param('id')) }));
  // --- JOURNAL ENTRIES ---
  const journalEntrySchema = z.object({
    date: z.number().positive("Date is required"),
    notes: z.string().min(1, "Notes are required"),
    bedId: z.string().optional(),
    plantingId: z.string().optional(),
    tags: z.array(z.string()).optional(),
  });
  app.get('/api/journal', async (c) => ok(c, (await JournalEntryEntity.list(c.env)).items));
  app.post('/api/journal', zValidator('json', journalEntrySchema), async (c) => ok(c, await JournalEntryEntity.create(c.env, { id: crypto.randomUUID(), ...c.req.valid('json'), createdAt: Date.now() })));
  app.put('/api/journal/:id', zValidator('json', journalEntrySchema.partial()), async (c) => {
    const { id } = c.req.param();
    const entry = new JournalEntryEntity(c.env, id);
    if (!(await entry.exists())) return notFound(c, 'Journal entry not found');
    await entry.patch(c.req.valid('json'));
    return ok(c, await entry.getState());
  });
  app.delete('/api/journal/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await JournalEntryEntity.delete(c.env, c.req.param('id')) }));
  // --- USER PROFILE ---
  const profileSchema = z.object({ location: z.string().min(2, "Location is required") });
  app.get('/api/profile', async (c) => {
    const profile = new UserProfileEntity(c.env, 'main');
    if (!(await profile.exists())) {
      return ok(c, await UserProfileEntity.create(c.env, UserProfileEntity.initialState));
    }
    return ok(c, await profile.getState());
  });
  app.put('/api/profile', zValidator('json', profileSchema), async (c) => {
    const profile = new UserProfileEntity(c.env, 'main');
    await profile.patch(c.req.valid('json'));
    return ok(c, await profile.getState());
  });
  // --- AI ADVISOR ---
  app.get('/api/advisor', async (c) => {
    const profile = await new UserProfileEntity(c.env, 'main').getState();
    const plantings = (await PlantingEntity.list(c.env)).items;
    const advice = getGardeningAdvice(profile, plantings);
    return ok(c, advice);
  });
}