import { MainLoader } from "@/src/components/shared/MainLoader";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <MainLoader size="md" label="Loading Settings" />
    </div>
  );
}
