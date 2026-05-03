export default function AppLayout({ children, bgImage = null }) {
    const finalBg = bgImage || "/bg.png";

    console.log("finalBg", finalBg);

    return (
        <div className="app-bg">
            <img src={finalBg} alt="" className="bg-image" />
            {children}
        </div>
    );
}
