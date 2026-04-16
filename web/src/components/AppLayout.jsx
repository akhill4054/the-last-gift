export default function AppLayout({ children }) {
    return (
        <div className="app-bg">
            <img src="/bg.png" alt="" className="bg-image" />
            {children}
        </div>
    );
}
