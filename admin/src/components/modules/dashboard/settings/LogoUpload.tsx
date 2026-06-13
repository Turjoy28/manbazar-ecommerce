"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/shared/imageUpload";
import { updateUiData } from "@/services/ui";

export default function LogoUpload({id, currentLogo}: {id: string, currentLogo: string}) {
    const [logo, setLogo] = useState(currentLogo);

    useEffect(() => {

        // প্রথম render এ API call করবে না
        if (!logo || logo === currentLogo) {
            return;
        }

        const uploadLogo = async () => {
            await updateUiData(
                id,
                {
                    "banner.logo": logo,
                }
            );
        };

        uploadLogo();

    }, [logo, id, currentLogo]);

    return (
        <ImageUpload
            title="Website Logo"
            description="Upload your website logo"
            value={logo ? [logo] : []}
            onChange={(images) => {
                setLogo(images[0] || "");
            }}
            maxFiles={1}
        />
    );
}