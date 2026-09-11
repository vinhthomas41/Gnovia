import MaterialsClient from "@/app/materials/materialsClient";
import { getMaterialSummaries } from "@/lib/materialData";

export default function MaterialsPage() {
  return <MaterialsClient materials={getMaterialSummaries()} />;
}
