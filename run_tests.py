# run_tests.py
import unittest
import sys
from pathlib import Path

def setup_test_environment():
    """Setup the Python path for tests."""
    root_dir = Path(__file__).parent
    src_dir = root_dir / 'src'
    sys.path.append(str(src_dir))

def run_tests(test_path: str = 'tests'):
    """Run all tests in the specified directory."""
    # Setup environment
    setup_test_environment()
    
    # Get the test directory
    test_dir = Path(test_path)
    if not test_dir.exists():
        print(f"Error: Test directory '{test_path}' not found")
        sys.exit(1)

    # Discover and run tests
    loader = unittest.TestLoader()
    suite = loader.discover(str(test_dir))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return 0 if tests passed, 1 if any failed
    return 0 if result.wasSuccessful() else 1

if __name__ == '__main__':
    sys.exit(run_tests())