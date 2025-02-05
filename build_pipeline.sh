curr_dir=$(pwd)
# build docker image  & push docker image to docker hub

cd "$curr_dir/OAuth2"
docker buildx build --platform linux/amd64,linux/arm64 -t moomtp/oauth2-server:latest --push .

cd "$curr_dir/res-assi"
docker buildx build --platform linux/amd64,linux/arm64 -t moomtp/res-assi-server:latest --push .
