export basename=node-ml-k8s
export version=0.4

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="
echo "Deploying "$basename":"$version
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="

echo "Cleaning up old microservices"
oc delete all -l part-of=microservices

"Updating servers with up to date YAML files"
oc apply -f ./k8s

for value in detector faceprocessor requester score sentiment server trainer transformer 
do
  echo "Starting build and push for" $value
  cd $value
  cp ../base-Containerfile ./Containerfile
  cp ../.dockerignore ./.dockerignore
  docker build -t docker.io/joellord/$basename-$value:$version .
  docker push docker.io/joellord/$basename-$value:$version

  echo "Create new-app for" $value
  oc new-app --docker-image=docker.io/joellord/$basename-$value:$version --name $value -l part-of=microservices -l app=$basename -l section=services -l component=$value --allow-missing-images --allow-missing-imagestream-tags
  cd ..
done

echo "Set environment variables"
oc set env deployment/server MONGO_URI=mongodb://admin:12345@mongodb

read -p "Also create new twitter service (this might result in rate limit exceeded) ?" yn
case $yn in
  [Yy]* ) oc new-app --docker-image=docker.io/joellord/$basename-twitter:$version --name twitter -l part-of=microservices -l app=$basename -l section=services -l component=twitter --allow-missing-images --allow-missing-imagestream-tags; break;;
  [Nn]* ) exit;;
esac