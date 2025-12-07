import { getExperiments } from '@/app/recipes/[id]/experiments/actions'
import ExperimentsClient from './ExperimentsClient'

interface ExperimentsPageProps {
  params: Promise<{ id: string }>
}

export default async function ExperimentsPage({ params }: ExperimentsPageProps) {
  const { id: recipeId } = await params
  const experiments = await getExperiments(recipeId)

  return <ExperimentsClient experiments={experiments} recipeId={recipeId} />
}
