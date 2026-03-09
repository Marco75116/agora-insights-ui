import { Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressSearchForm } from "@/components/wallet/AddressSearchForm";

export function AddressSearchCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Wallet className="text-primary h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Enter an address to view AUSD balance across chains</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AddressSearchForm />
      </CardContent>
    </Card>
  );
}
