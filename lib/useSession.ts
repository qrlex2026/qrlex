"use client";
import { useState, useEffect } from "react";

export function useSession() {
    const [restaurantId, setRestaurantId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then((data) => {
                setRestaurantId(data.restaurantId || "");
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return { restaurantId, loading };
}
