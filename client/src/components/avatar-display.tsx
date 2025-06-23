import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface AvatarDisplayProps {
  avatarUrl: string;
}

export default function AvatarDisplay({ avatarUrl }: AvatarDisplayProps) {
  return (
    <div className="flex justify-center">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl} alt="Agent avatar" />
        <AvatarFallback>
          <User className="h-10 w-10" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
