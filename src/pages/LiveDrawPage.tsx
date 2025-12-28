import LiveDraw from "@/components/admin/LiveDraw";

const LiveDrawPage = () => {
    // Standalone page for the popup window
    // It reuses the LiveDraw component but ensures full screen height background
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1d244a] to-[#2a3459] p-4 flex items-center justify-center">
            <div className="w-full">
                <LiveDraw />
            </div>
        </div>
    );
};

export default LiveDrawPage;
