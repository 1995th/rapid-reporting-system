import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileInformation } from "@/components/profile/ProfileInformation";
import { PasswordUpdate } from "@/components/profile/PasswordUpdate";
import { UserReportsSection } from "@/components/profile/UserReportsSection";

const Profile = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      return user;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ProfileInformation />
      <PasswordUpdate />
      {profile && <UserReportsSection userId={profile.id} />}
    </div>
  );
};

export default Profile;