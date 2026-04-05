---
name: travel
description: >
  Travel itinerary planning assistant.
  Add new locations to your Seoul trip, search for places, or reorganize schedules.
  
  Examples:
  - /travel add "Fritz Coffee Company"
  - /travel add "N Seoul Tower" --day 3
  - /travel search "Hongdae cafes"
  - /travel move "hair salon" --to-day 2
---

# Travel Command

Help users plan their Seoul travel itinerary by managing locations and schedules.

## Actions

### add <location> [--day N]
Add a new location to the itinerary with intelligent planning.

Process:
1. Invoke `travel-planner` agent
2. Agent searches for place details (name, address, coordinates)
3. Calculates distance to existing districts (500m threshold)
4. Scores each day based on proximity, district match, capacity
5. Plans transit using seoul-metro API when appropriate
6. Presents complete plan to user
7. On confirmation, modifies data files

Example: `/travel add "Fritz Coffee Company"`

### search <keyword>
Search for place information without modifying data.

Example: `/travel search "Hongdae cafes"`

### move <location> --to-day N
Move an existing location to a different day.

Example: `/travel move "hair salon" --to-day 3`

### remove <location>
Remove a location from the itinerary.

Example: `/travel remove "old restaurant"`

## Agent Integration

This command delegates all planning logic to the `travel-planner` agent.
The agent has access to:
- WebSearch/WebFetch for place lookup
- Read/Write/Edit for data file modifications
- Bash for running tests

## Data Files Modified

- `src/data/seoul/locations.ts` - Add new locations, update group children
- `src/data/seoul/days.ts` - Insert path points, update transit details
