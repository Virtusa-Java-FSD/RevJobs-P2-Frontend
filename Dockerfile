# # Frontend Dockerfile for RevJobs React App

# FROM node:18-alpine as builder

# WORKDIR /app

# COPY package*.json ./

# RUN npm ci

# COPY . .

# Run npm run build

# From nginx:alpine As production 

# Run rm-rf/user/share/nginx/html/*

# copy --from=builder/app/distuser/share/nginx/html

# expose 80
 
# #Start Nginx
# CMD [ "Nginx", "-g","gaemon off;" ]

# EXPOSE 3000

# CMD ["npm", "start"]