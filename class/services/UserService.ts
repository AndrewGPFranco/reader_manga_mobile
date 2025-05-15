import useAuthStore from "@/stores/authStore";

class UserService {

    private readonly userStore = useAuthStore.getState();

    async getProfilePhoto() {
        return await this.userStore.getProfilePhoto();
    }

}

export default UserService;