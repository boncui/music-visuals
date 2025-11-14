import redis.asyncio as redis
import json
import hashlib
from typing import Any, Dict, Optional
from loguru import logger
import os

class RedisClient:
    """Redis client for caching and real-time communication"""
    
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.client: Optional[redis.Redis] = None
        self.pubsub = None
        
    async def connect(self):
        """Connect to Redis server"""
        try:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            await self.client.ping()
            logger.info("✅ Connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise e
    
    async def disconnect(self):
        """Disconnect from Redis server"""
        try:
            if self.client:
                await self.client.close()
                logger.info("✅ Disconnected from Redis")
        except Exception as e:
            logger.error(f"Error disconnecting from Redis: {str(e)}")
    
    async def set_analysis_result(self, file_url: str, analysis_data: Dict[str, Any], 
                                 expire_seconds: int = 3600):
        """Cache audio analysis results"""
        try:
            # Create hash key for the file
            file_hash = hashlib.md5(file_url.encode()).hexdigest()
            key = f"analysis:{file_hash}"
            
            # Store analysis data
            await self.client.setex(key, expire_seconds, json.dumps(analysis_data))
            logger.info(f"Cached analysis result for file: {file_url}")
            
        except Exception as e:
            logger.error(f"Error caching analysis result: {str(e)}")
            raise e
    
    async def get_analysis_result(self, file_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached audio analysis results"""
        try:
            key = f"analysis:{file_hash}"
            result = await self.client.get(key)
            
            if result:
                return json.loads(result)
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving analysis result: {str(e)}")
            return None
    
    async def set_realtime_audio_data(self, user_id: str, audio_data: Dict[str, Any], 
                                    expire_seconds: int = 5):
        """Store real-time audio data"""
        try:
            key = f"audio:{user_id}:latest"
            await self.client.setex(key, expire_seconds, json.dumps(audio_data))
            
        except Exception as e:
            logger.error(f"Error storing real-time audio data: {str(e)}")
    
    async def get_realtime_audio_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve real-time audio data"""
        try:
            key = f"audio:{user_id}:latest"
            result = await self.client.get(key)
            
            if result:
                return json.loads(result)
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving real-time audio data: {str(e)}")
            return None
    
    async def publish_audio_data(self, channel: str, audio_data: Dict[str, Any]):
        """Publish audio data to Redis channel"""
        try:
            await self.client.publish(channel, json.dumps(audio_data))
            
        except Exception as e:
            logger.error(f"Error publishing audio data: {str(e)}")
    
    async def subscribe_to_audio_channel(self, channel: str, callback_func):
        """Subscribe to audio data channel"""
        try:
            self.pubsub = self.client.pubsub()
            await self.pubsub.subscribe(channel)
            
            async for message in self.pubsub.listen():
                if message['type'] == 'message':
                    try:
                        audio_data = json.loads(message['data'])
                        await callback_func(audio_data)
                    except Exception as e:
                        logger.error(f"Error processing audio message: {str(e)}")
                        
        except Exception as e:
            logger.error(f"Error subscribing to audio channel: {str(e)}")
    
    async def set_visual_parameters(self, user_id: str, parameters: Dict[str, Any], 
                                   expire_seconds: int = 3600):
        """Store visual parameters"""
        try:
            key = f"visual:{user_id}:parameters"
            await self.client.setex(key, expire_seconds, json.dumps(parameters))
            
        except Exception as e:
            logger.error(f"Error storing visual parameters: {str(e)}")
    
    async def get_visual_parameters(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve visual parameters"""
        try:
            key = f"visual:{user_id}:parameters"
            result = await self.client.get(key)
            
            if result:
                return json.loads(result)
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving visual parameters: {str(e)}")
            return None
    
    async def set_current_preset(self, user_id: str, preset_id: str, 
                                expire_seconds: int = 3600):
        """Store current visual preset"""
        try:
            key = f"user:{user_id}:current-preset"
            await self.client.setex(key, expire_seconds, preset_id)
            
        except Exception as e:
            logger.error(f"Error storing current preset: {str(e)}")
    
    async def get_current_preset(self, user_id: str) -> Optional[str]:
        """Retrieve current visual preset"""
        try:
            key = f"user:{user_id}:current-preset"
            return await self.client.get(key)
            
        except Exception as e:
            logger.error(f"Error retrieving current preset: {str(e)}")
            return None
    
    async def increment_preset_usage(self, preset_id: str):
        """Increment preset usage counter"""
        try:
            key = f"preset:{preset_id}:usage"
            await self.client.incr(key)
            
        except Exception as e:
            logger.error(f"Error incrementing preset usage: {str(e)}")
    
    async def get_preset_usage(self, preset_id: str) -> int:
        """Get preset usage count"""
        try:
            key = f"preset:{preset_id}:usage"
            result = await self.client.get(key)
            return int(result) if result else 0
            
        except Exception as e:
            logger.error(f"Error getting preset usage: {str(e)}")
            return 0
    
    async def store_chat_message(self, room_id: str, message: Dict[str, Any], 
                               max_messages: int = 100):
        """Store chat message in room history"""
        try:
            key = f"chat:{room_id}:history"
            
            # Add message to list
            await self.client.lpush(key, json.dumps(message))
            
            # Trim to max messages
            await self.client.ltrim(key, 0, max_messages - 1)
            
            # Set expiration (24 hours)
            await self.client.expire(key, 86400)
            
        except Exception as e:
            logger.error(f"Error storing chat message: {str(e)}")
    
    async def get_chat_history(self, room_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve chat history for a room"""
        try:
            key = f"chat:{room_id}:history"
            messages = await self.client.lrange(key, 0, limit - 1)
            
            return [json.loads(msg) for msg in messages]
            
        except Exception as e:
            logger.error(f"Error retrieving chat history: {str(e)}")
            return []
    
    async def set_room_state(self, room_id: str, state: Dict[str, Any], 
                           expire_seconds: int = 3600):
        """Store room state"""
        try:
            key = f"visual:room:{room_id}:state"
            await self.client.setex(key, expire_seconds, json.dumps(state))
            
        except Exception as e:
            logger.error(f"Error storing room state: {str(e)}")
    
    async def get_room_state(self, room_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve room state"""
        try:
            key = f"visual:room:{room_id}:state"
            result = await self.client.get(key)
            
            if result:
                return json.loads(result)
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving room state: {str(e)}")
            return None

