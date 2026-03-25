import { MainLoader } from "@/src/components/shared/MainLoader";

export default function CommonLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8">
      <MainLoader label="Loading" />
    </div>
  );
}
