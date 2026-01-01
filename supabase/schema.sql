-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_equipment table
CREATE TABLE IF NOT EXISTS recipe_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_outputs table
CREATE TABLE IF NOT EXISTS recipe_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_steps table
CREATE TABLE IF NOT EXISTS recipe_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_experiments table
CREATE TABLE IF NOT EXISTS recipe_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiment_photos table
CREATE TABLE IF NOT EXISTS experiment_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES recipe_experiments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiment_equipment table (archive snapshot)
CREATE TABLE IF NOT EXISTS experiment_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES recipe_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiment_ingredients table (archive snapshot)
CREATE TABLE IF NOT EXISTS experiment_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES recipe_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiment_outputs table (archive snapshot)
CREATE TABLE IF NOT EXISTS experiment_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES recipe_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiment_steps table (archive snapshot)
CREATE TABLE IF NOT EXISTS experiment_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES recipe_experiments(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_steps_updated_at
  BEFORE UPDATE ON recipe_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipes
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for recipe_equipment
CREATE POLICY "Users can view equipment for their recipes"
  ON recipe_equipment FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_equipment.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert equipment for their recipes"
  ON recipe_equipment FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_equipment.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update equipment for their recipes"
  ON recipe_equipment FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_equipment.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete equipment for their recipes"
  ON recipe_equipment FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_equipment.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for recipe_ingredients
CREATE POLICY "Users can view ingredients for their recipes"
  ON recipe_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredients for their recipes"
  ON recipe_ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredients for their recipes"
  ON recipe_ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients for their recipes"
  ON recipe_ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for recipe_outputs
CREATE POLICY "Users can view outputs for their recipes"
  ON recipe_outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_outputs.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert outputs for their recipes"
  ON recipe_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_outputs.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update outputs for their recipes"
  ON recipe_outputs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_outputs.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete outputs for their recipes"
  ON recipe_outputs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_outputs.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for recipe_steps
CREATE POLICY "Users can view steps for their recipes"
  ON recipe_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert steps for their recipes"
  ON recipe_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update steps for their recipes"
  ON recipe_steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete steps for their recipes"
  ON recipe_steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for recipe_experiments
CREATE POLICY "Users can view experiments for their recipes"
  ON recipe_experiments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_experiments.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert experiments for their recipes"
  ON recipe_experiments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_experiments.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete experiments for their recipes"
  ON recipe_experiments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_experiments.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for experiment_photos
CREATE POLICY "Users can view photos for their experiments"
  ON experiment_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_photos.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their experiments"
  ON experiment_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_photos.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos for their experiments"
  ON experiment_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_photos.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for experiment_equipment
CREATE POLICY "Users can view equipment for their experiments"
  ON experiment_equipment FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_equipment.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert equipment for their experiments"
  ON experiment_equipment FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_equipment.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for experiment_ingredients
CREATE POLICY "Users can view ingredients for their experiments"
  ON experiment_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_ingredients.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredients for their experiments"
  ON experiment_ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_ingredients.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for experiment_outputs
CREATE POLICY "Users can view outputs for their experiments"
  ON experiment_outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_outputs.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert outputs for their experiments"
  ON experiment_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_outputs.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create RLS policies for experiment_steps
CREATE POLICY "Users can view steps for their experiments"
  ON experiment_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_steps.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert steps for their experiments"
  ON experiment_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_experiments
      JOIN recipes ON recipes.id = recipe_experiments.recipe_id
      WHERE recipe_experiments.id = experiment_steps.experiment_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
-- Composite index for RLS policies that check both id and user_id
CREATE INDEX IF NOT EXISTS idx_recipes_id_user_id ON recipes(id, user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_equipment_recipe_id ON recipe_equipment(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_outputs_recipe_id ON recipe_outputs(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_experiments_recipe_id ON recipe_experiments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_experiments_created_at ON recipe_experiments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiment_photos_experiment_id ON experiment_photos(experiment_id);
-- Composite index for experiment_photos to optimize queries filtering by experiment_id and ordering by order
CREATE INDEX IF NOT EXISTS idx_experiment_photos_experiment_id_order ON experiment_photos(experiment_id, "order");
CREATE INDEX IF NOT EXISTS idx_experiment_equipment_experiment_id ON experiment_equipment(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_ingredients_experiment_id ON experiment_ingredients(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_outputs_experiment_id ON experiment_outputs(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_steps_experiment_id ON experiment_steps(experiment_id);

