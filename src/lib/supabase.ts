import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface Pet {
  id: string;
  user_id: string;
  owner_name: string | null;
  name: string;
  type: 'cat' | 'dog' | 'fox' | 'bird' | 'rabbit' | 'bear' | 'panda' | 'koala' | 'hamster' | 'mouse' | 'pig' | 'frog' | 'monkey' | 'lion' | 'tiger' | 'cow' | 'turkey' | 'dragon' | 'shark' | 'seal' | 'crocodile' | 'flamingo' | 'duck' | 'turtle' | 'butterfly' | 'elephant' | 'giraffe' | 'dinosaur' | 'crab' | 'lobster' | 'shrimp' | 'squid' | 'octopus' | 'pufferfish' | 'eagle' | 'owl' | 'bat' | 'bee' | 'unicorn' | 'boar' | 'dolphin' | 'whale' | 'leopard' | 'swan' | 'parrot' | 'badger' | 'rat' | 'squirrel' | 'hedgehog' | 'rhino' | 'waterbuffalo' | 'kangaroo' | 'camel' | 'dromedary' | 'ox' | 'horse' | 'ram' | 'deer' | 'goat' | 'sheep';
  breed?: string | null;
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  thirst: number;
  age: number;
  level: number;
  xp: number;
  coins: number;
  accessories: {
    hat: string | null;
    eyewear: string | null;
    toy: string | null;
  };
  last_fed: string;
  last_played: string;
  last_cleaned: string;
  last_toy_played: string;
  toy_play_count: number;
  last_salon: string;
  last_playground: string;
  last_school: string;
  last_bakery: string;
  last_dance: string;
  last_sports: string;
  last_mutation_check: string;
  current_event: string | null;
  event_started_at: string | null;
  is_sleeping: boolean;
  sleep_started_at: string | null;
  sleep_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'hat' | 'eyewear' | 'toy' | 'furniture' | 'decor';
  emoji: string;
  price: number;
  created_at: string;
}

export interface HouseInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  item_type: string;
  item_emoji: string;
  quantity: number;
  placed: boolean;
  room: 'lower' | 'upper' | null;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
}

export interface PetInventoryItem {
  id: string;
  user_id: string;
  pet_id: string;
  is_active: boolean;
  created_at: string;
}

export interface AccessoryInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  item_type: 'hat' | 'toy' | 'eyewear';
  item_emoji: string;
  quantity: number;
  created_at: string;
}

export interface UserActivity {
  user_id: string;
  last_active: string;
  is_online: boolean;
}

export interface UserSettings {
  user_id: string;
  username: string;
  trades_enabled: boolean;
  bio: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_pet_id: string;
  recipient_pet_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeItem {
  id: string;
  trade_request_id: string;
  sender_offering: boolean;
  item_id: string;
  item_type: 'hat' | 'eyewear' | 'toy' | 'furniture' | 'decor';
  item_name: string;
  item_emoji: string;
  created_at: string;
}

export interface AdminUser {
  user_id: string;
  granted_by: string | null;
  granted_at: string;
  is_super_admin: boolean;
}

export interface BannedUser {
  user_id: string;
  banned_by: string | null;
  banned_at: string;
  reason: string;
  is_active: boolean;
}

export type PetEventType = 'sick' | 'injured' | 'depressed' | 'extra_hungry' | 'thirsty' | 'anxious' | 'tired' | 'overfed' | 'overhydrated';

export interface PetEvent {
  type: PetEventType;
  emoji: string;
  title: string;
  description: string;
  effects: {
    hunger?: number;
    happiness?: number;
    cleanliness?: number;
    energy?: number;
    thirst?: number;
  };
  resolution: string;
}

export const PET_EVENTS: Record<PetEventType, PetEvent> = {
  sick: {
    type: 'sick',
    emoji: '🤒',
    title: 'Feeling Sick',
    description: 'Your pet is not feeling well and needs extra care',
    effects: { energy: -20, happiness: -15 },
    resolution: 'Clean and feed your pet to help them recover'
  },
  injured: {
    type: 'injured',
    emoji: '🩹',
    title: 'Got Injured',
    description: 'Your pet got a minor injury while playing',
    effects: { energy: -25, happiness: -20 },
    resolution: 'Give them rest by keeping them clean and fed'
  },
  depressed: {
    type: 'depressed',
    emoji: '😢',
    title: 'Feeling Down',
    description: 'Your pet is feeling lonely and sad',
    effects: { happiness: -30, energy: -10 },
    resolution: 'Play with them to cheer them up'
  },
  extra_hungry: {
    type: 'extra_hungry',
    emoji: '🍖',
    title: 'Extra Hungry',
    description: 'Your pet has worked up a big appetite',
    effects: { hunger: -30, energy: -15 },
    resolution: 'Feed them multiple times to satisfy their hunger'
  },
  thirsty: {
    type: 'thirsty',
    emoji: '💧',
    title: 'Very Thirsty',
    description: 'Your pet needs water right away',
    effects: { thirst: -40, energy: -10 },
    resolution: 'Give them water to drink'
  },
  anxious: {
    type: 'anxious',
    emoji: '😰',
    title: 'Feeling Anxious',
    description: 'Your pet is stressed and needs comfort',
    effects: { happiness: -25, energy: -20 },
    resolution: 'Spend time playing and cleaning them'
  },
  tired: {
    type: 'tired',
    emoji: '😴',
    title: 'Exhausted',
    description: 'Your pet is extremely tired and needs rest',
    effects: { energy: -35, happiness: -10 },
    resolution: 'Let them rest by not playing for a while'
  },
  overfed: {
    type: 'overfed',
    emoji: '🤢',
    title: 'Overfed',
    description: 'Your pet ate too much and feels sick',
    effects: {},
    resolution: 'Wait 5 minutes for them to recover'
  },
  overhydrated: {
    type: 'overhydrated',
    emoji: '🤢',
    title: 'Overhydrated',
    description: 'Your pet drank too much water and feels sick',
    effects: {},
    resolution: 'Wait 5 minutes for them to recover'
  }
};

export type ActivityType = 'salon' | 'playground' | 'school' | 'bakery' | 'dance' | 'sports';

export interface Activity {
  type: ActivityType;
  emoji: string;
  name: string;
  description: string;
  cost: number;
  cooldown: number;
  duration: string;
  xpReward: number;
  coinReward: number;
  effects: {
    hunger?: number;
    happiness?: number;
    cleanliness?: number;
    energy?: number;
    thirst?: number;
  };
}

export const ACTIVITIES: Record<ActivityType, Activity> = {
  salon: {
    type: 'salon',
    emoji: '💅',
    name: 'Pet Salon',
    description: 'Pamper your pet with a spa day',
    cost: 30,
    cooldown: 300000,
    duration: '5 min',
    xpReward: 40,
    coinReward: 10,
    effects: { cleanliness: 50, happiness: 20 }
  },
  playground: {
    type: 'playground',
    emoji: '🎪',
    name: 'Playground',
    description: 'Let your pet play with friends',
    cost: 0,
    cooldown: 600000,
    duration: '10 min',
    xpReward: 50,
    coinReward: 20,
    effects: { happiness: 40, energy: -20 }
  },
  school: {
    type: 'school',
    emoji: '🎓',
    name: 'Pet School',
    description: 'Teach your pet new tricks',
    cost: 50,
    cooldown: 900000,
    duration: '15 min',
    xpReward: 100,
    coinReward: 50,
    effects: { happiness: 15, energy: -10 }
  },
  bakery: {
    type: 'bakery',
    emoji: '🧁',
    name: 'Pet Bakery',
    description: 'Treat your pet to special snacks',
    cost: 40,
    cooldown: 450000,
    duration: '7.5 min',
    xpReward: 35,
    coinReward: 15,
    effects: { hunger: 40, happiness: 30, thirst: -10 }
  },
  dance: {
    type: 'dance',
    emoji: '💃',
    name: 'Dance Class',
    description: 'Learn fun dance moves together',
    cost: 35,
    cooldown: 600000,
    duration: '10 min',
    xpReward: 60,
    coinReward: 25,
    effects: { happiness: 35, energy: -25 }
  },
  sports: {
    type: 'sports',
    emoji: '⚽',
    name: 'Sports Center',
    description: 'Exercise and stay healthy',
    cost: 25,
    cooldown: 450000,
    duration: '7.5 min',
    xpReward: 45,
    coinReward: 20,
    effects: { happiness: 25, energy: -30, thirst: -20 }
  }
};
