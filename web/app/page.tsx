"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
            window.location.replace("/login");
        }, []);
    return (
        <main>
        </main>
    );
}