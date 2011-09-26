desc "Builds"
task :build do
  system "proton build"
end

desc "Deploys"
task :deploy => :build do
  system "git update-ghpages rstacruz/lorem -b gh-pages -i output"
end
