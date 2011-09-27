task :docco do
  system "cd site; docco gen.coffee; mv docs/gen.html source/index.html; cat docs/docco.css source/extra.css > source/docco.css; rm -rf docs"
end

desc "Builds"
task :build => :docco do
  system "proton build"
end

desc "Deploys"
task :deploy => :build do
  system "git update-ghpages rstacruz/lorem -b gh-pages -i output"
end
