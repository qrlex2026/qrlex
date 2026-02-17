export default function SlugLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ backgroundColor: "transparent" }} className="!bg-transparent">
            {children}
        </div>
    );
}
