import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Soroban DevConsole",
    description: "Developer toolkit for Soroban smart contracts",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}