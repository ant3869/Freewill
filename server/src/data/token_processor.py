# src/data/token_processor.py
from typing import List, AsyncGenerator, Dict, Any
from ..core.exceptions import TokenizationError
from ..core.constants import ErrorCodes

class TokenProcessor:
    def __init__(self, batch_size: int = 32):
        self.batch_size = batch_size
        self._metrics = {
            'processed': 0,
            'dropped': 0,
            'total_batches': 0
        }

    async def process_stream(
        self,
        tokens: AsyncGenerator[str, None],
        max_tokens: int
    ) -> AsyncGenerator[List[str], None]:
        """Process a stream of tokens in batches."""
        try:
            batch = []
            token_count = 0

            async for token in tokens:
                token_count += 1
                if token_count > max_tokens:
                    raise TokenizationError(
                        message="Token limit exceeded",
                        code=ErrorCodes.TOKEN_LIMIT_EXCEEDED,
                        details={"limit": max_tokens, "received": token_count}
                    )

                batch.append(token)
                
                if len(batch) >= self.batch_size:
                    processed_batch = self._process_batch(batch)
                    yield processed_batch
                    batch = []

            # Process remaining tokens
            if batch:
                processed_batch = self._process_batch(batch)
                yield processed_batch

        except Exception as e:
            if not isinstance(e, TokenizationError):
                raise TokenizationError(
                    message="Token processing failed",
                    code=ErrorCodes.TOKEN_PROCESS_FAILED,
                    details={"error": str(e)}
                )
            raise

    def _process_batch(self, batch: List[str]) -> List[str]:
        """Process a batch of tokens."""
        try:
            # Basic processing - can be expanded later
            processed = [t.strip() for t in batch if t.strip()]
            
            # Update metrics
            self._metrics['processed'] += len(processed)
            self._metrics['dropped'] += len(batch) - len(processed)
            self._metrics['total_batches'] += 1
            
            return processed
            
        except Exception as e:
            raise TokenizationError(
                message="Batch processing failed",
                code=ErrorCodes.TOKEN_PROCESS_FAILED,
                details={"error": str(e), "batch_size": len(batch)}
            )

    def get_metrics(self) -> Dict[str, Any]:
        """Get current processing metrics."""
        return {
            **self._metrics,
            'average_batch_size': (
                self._metrics['processed'] / self._metrics['total_batches'] 
                if self._metrics['total_batches'] > 0 else 0
            )
        }