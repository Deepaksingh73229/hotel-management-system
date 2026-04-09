import Image from "next/image"
import logo from "@/assets/logo.svg"

export function TeamSwitcher() {
    return (
        <div className="flex gap-3 items-center">
            <Image
                alt="hotel-logo"
                src={logo}
                className="aspect-square w-12 p-0.5 bg-neutral-700 rounded-xl"
            />

            <div className="flex flex-col items-start">
                <p className="text-amber-500 text-lg font-black">The Golden Sunrise</p>
                <p className="text-neutral-400">ERP System</p>
            </div>
        </div>
    )
}
