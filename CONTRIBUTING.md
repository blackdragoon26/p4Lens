# Contributing to P4Lens

Thank you for your interest in contributing to P4Lens! 🎉

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/p4Lens.git
   cd p4Lens
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Quick Start
```bash
./start.sh
```

### Manual Setup
See the [README.md](README.md) for detailed setup instructions.

## Making Changes

### Backend (Python/FastAPI)

- Code is in `backend/`
- Main API: `backend/main.py`
- Parser logic: `backend/parser_utils.py`
- Follow PEP 8 style guidelines
- Add type hints where possible

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (React/Vite)

- Code is in `frontend/src/`
- Main app: `frontend/src/App.jsx`
- Visualization: `frontend/src/components/ui/PipelineFlow.jsx`
- Use functional components with hooks
- Follow existing code style

```bash
cd frontend
npm install
npm run dev
```

## Code Style

### Python
- Use `black` for formatting
- Use `flake8` for linting
- Maximum line length: 88 characters (black default)

### JavaScript/React
- Use ESLint configuration provided
- Run `npm run lint` before committing
- Use meaningful variable names

## Testing

Currently, P4Lens doesn't have automated tests. **Contributing tests is highly encouraged!**

### Suggested test areas:
- P4 parser functionality
- API endpoint responses
- UI component rendering
- File upload handling

## Commit Messages

Use clear, descriptive commit messages:

- ✅ Good: `Add support for P4_16 switch statements`
- ✅ Good: `Fix parser crash on empty control blocks`
- ❌ Bad: `fix bug`
- ❌ Bad: `update code`

## Pull Request Process

1. **Update documentation** if you're adding features
2. **Test your changes** locally
3. **Update README.md** if needed
4. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Screenshots (if UI changes)
   - Reference any related issues

## Areas for Contribution

### High Priority
- [ ] Add unit and integration tests
- [ ] Improve P4 parsing accuracy
- [ ] Support more P4 constructs
- [ ] Error handling improvements
- [ ] Performance optimizations

### Features
- [ ] P4Runtime integration
- [ ] Export visualizations as SVG/PNG
- [ ] Dark mode support
- [ ] Comparison of multiple P4 files
- [ ] Interactive debugging features
- [ ] Support for custom P4 architectures

### Documentation
- [ ] More code comments
- [ ] Tutorial videos
- [ ] Example P4 programs
- [ ] Architecture documentation

## Questions?

Feel free to:
- Open an issue for discussion
- Ask questions in pull requests
- Reach out to maintainers

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the project

Thank you for contributing! 🙏
