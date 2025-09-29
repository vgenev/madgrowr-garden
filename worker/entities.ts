import { IndexedEntity } from "./core-utils";
import type { Bed, Planting, Task, JournalEntry, UserProfile } from "@shared/types";
// BED ENTITY
export class BedEntity extends IndexedEntity<Bed> {
  static readonly entityName = "bed";
  static readonly indexName = "beds";
  static readonly initialState: Bed = { id: "", name: "", width: 0, height: 0, createdAt: 0 };
}
// PLANTING ENTITY
export class PlantingEntity extends IndexedEntity<Planting> {
  static readonly entityName = "planting";
  static readonly indexName = "plantings";
  static readonly initialState: Planting = { id: "", bedId: "", cropName: "", plantingDate: 0, createdAt: 0 };
}
// TASK ENTITY
export class TaskEntity extends IndexedEntity<Task> {
  static readonly entityName = "task";
  static readonly indexName = "tasks";
  static readonly initialState: Task = { id: "", title: "", dueDate: 0, completed: false, createdAt: 0 };
}
// JOURNAL ENTRY ENTITY
export class JournalEntryEntity extends IndexedEntity<JournalEntry> {
  static readonly entityName = "journal";
  static readonly indexName = "journals";
  static readonly initialState: JournalEntry = { id: "", date: 0, notes: "", createdAt: 0 };
}
// USER PROFILE ENTITY (Singleton)
export class UserProfileEntity extends IndexedEntity<UserProfile> {
  static readonly entityName = "userProfile";
  static readonly indexName = "userProfiles"; // Index is not really used for a singleton but required by the class
  static readonly initialState: UserProfile = { id: "main", location: "" };
}