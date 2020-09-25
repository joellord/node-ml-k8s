echo "Starting RabbitMQ"
echo " Management interface available at http://localhost:15672"
docker run -d --rm --name rabbitmq \
 -p 5672:5672 \
 -p 15672:15672 \
 --hostname my-rabbit \
 rabbitmq:management

echo "Starting Mongo Database (data persisted in ./data)"
docker run -d --rm --name mongo \
 -e MONGO_INITDB_ROOT_USERNAME=admin \
 -e MONGO_INITDB_ROOT_PASSWORD=12345 \
 --network node-ml-k8s \
 -p 27017:27017 \
 -v data:/data/db \
 mongo:4.4

echo "Starting Mongo-express"
echo " Interface available at http://localhost:8882"
docker run -d --rm --name mongo-admin \
 --network node-ml-k8s \
 -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
 -e ME_CONFIG_MONGODB_ADMINPASSWORD=12345 \
 -p 8882:8081 \
 mongo-express:0.54