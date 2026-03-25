import { MainLoader } from "@/src/components/shared/MainLoader";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <MainLoader />
    </div>
  );
}
