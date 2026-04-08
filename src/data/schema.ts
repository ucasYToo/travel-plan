import { z } from 'zod'

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  color: z.string(),
  type: z.literal('spot'),
  description: z.string().optional(),
  parentId: z.string(),
  address: z.string().optional(),
})

export const locationGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  color: z.string(),
  type: z.enum(['group', 'hotel_group']),
  description: z.string().optional(),
  address: z.string().optional(),
  children: z.array(z.string()),
})

export const locationOrGroupSchema = z.union([locationSchema, locationGroupSchema])

export const transitStepSchema = z.object({
  mode: z.enum(['walk', 'subway', 'bus', 'train', 'taxi', 'airport']),
  line: z.string().optional(),
  from: z.string(),
  to: z.string(),
  duration: z.string(),
  distance: z.string().optional(),
  instruction: z.string(),
})

export const transitDetailSchema = z.object({
  distance: z.string(),
  duration: z.string(),
  fare: z.string().optional(),
  steps: z.array(transitStepSchema),
  startName: z.string(),
  endName: z.string(),
})

export const noteItemSchema = z.object({
  category: z.enum(['food', 'shopping', 'tips', 'other']),
  content: z.string(),
})

export const pathPointSchema = z.object({
  locationId: z.string(),
  label: z.string(),
  transit: transitDetailSchema.optional(),
  isHotel: z.boolean().optional(),
  notes: z.array(noteItemSchema).optional(),
})

export const dayPlanSchema = z.object({
  day: z.number(),
  date: z.string().optional(),
  title: z.string(),
  note: z.string(),
  baseHotelId: z.string(),
  path: z.array(pathPointSchema),
})

export const mapCenterSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export const itineraryMetadataSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mapCenter: mapCenterSchema.optional(),
  mapZoom: z.number().optional(),
  cityLabel: z.string().optional(),
  seasonLabel: z.string().optional(),
})

export const itinerarySchema = z.object({
  metadata: itineraryMetadataSchema,
  locations: z.record(z.string(), locationOrGroupSchema),
  days: z.array(dayPlanSchema),
})

export type ItinerarySchema = z.infer<typeof itinerarySchema>
