import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import { getExperiments } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import ExperimentsClient from "./ExperimentsClient";

interface ExperimentsPageProps {
  params: Promise<{ recipeId: string }>;
}

export default async function ExperimentsPage({ params }: ExperimentsPageProps) {
  const user = await getServerUser();
  if (!user) {
    redirect("/auth");
  }

  const { recipeId } = await params;
  const experiments = await getExperiments(recipeId);

  return <ExperimentsClient experiments={experiments} recipeId={recipeId} />;
}

