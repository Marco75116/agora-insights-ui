"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidEthereumAddress } from "@/lib/helpers/address";

export function AddressSearchForm() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError("Please enter a wallet address");
      return;
    }

    if (!isValidEthereumAddress(trimmedAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    router.push(`/dashboard/wallet/${trimmedAddress.toLowerCase()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder="0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-invalid={!!error}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
      <Button type="submit">
        <Search />
        View Balance
      </Button>
    </form>
  );
}
