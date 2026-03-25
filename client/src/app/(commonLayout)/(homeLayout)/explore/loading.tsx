import { MainLoader } from "@/src/components/shared/MainLoader";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <MainLoader label="Exploring" />
    </div>
  );
}
